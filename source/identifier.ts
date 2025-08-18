import type {Context as BaseContext} from 'grammy';
import type {Message, MessageEntity} from 'grammy/types';

const URL_TEXT = '\u200C';
const BASE_URL = 'http://t.me/#';
const URL_SEPERATOR = '#';

type ReplyToMessage = NonNullable<Message.CommonMessage['reply_to_message']>;
export type ReplyToMessageContext<Context extends BaseContext> = Context & {
	message: Message.CommonMessage & {reply_to_message: ReplyToMessage};
};
export type UrlMessageEntity = Readonly<MessageEntity.TextLinkMessageEntity>;

export function isContextReplyToMessage<Context extends BaseContext>(context: Context): context is ReplyToMessageContext<Context> {
	return Boolean(context.message?.reply_to_message);
}

function getRelevantEntity<Context extends BaseContext>(context: ReplyToMessageContext<Context>): UrlMessageEntity | undefined {
	const repliedTo = context.message.reply_to_message;
	const entities: ReadonlyArray<Readonly<MessageEntity>> = repliedTo.entities
		?? repliedTo.caption_entities ?? [];
	const relevantEntity = entities
		.slice(-1)
		.find((o): o is UrlMessageEntity => o.type === 'text_link');
	return relevantEntity;
}

export function isReplyToQuestion<Context extends BaseContext>(
	context: ReplyToMessageContext<Context>,
	identifier: string,
): boolean {
	const relevantEntity = getRelevantEntity(context);
	const expectedUrl = url(identifier, undefined);
	return Boolean(relevantEntity?.url.startsWith(expectedUrl));
}

export function getAdditionalState<Context extends BaseContext>(
	context: ReplyToMessageContext<Context>,
	identifier: string,
): string {
	const relevantEntity = getRelevantEntity(context)!;
	const expectedUrl = url(identifier, undefined);
	const part = relevantEntity.url.slice(expectedUrl.length);
	return decodeURIComponent(part);
}

function url(identifier: string, additionalState: string | undefined): string {
	return BASE_URL
		+ identifier
		+ URL_SEPERATOR
		+ encodeURIComponent(additionalState ?? '');
}

const MARKDOWN_PREFIX = `[${URL_TEXT}](`;
export function suffixMarkdown(
	identifier: string,
	additionalState: string | undefined,
): string {
	const part = url(identifier, additionalState);
	if (part.includes(')')) {
		throw new Error('Markdown does not work with a stateless-question identifier or additionalState containing a close bracket `)`. Use MarkdownV2 or HTML.');
	}

	return MARKDOWN_PREFIX + part + ')';
}

export function suffixMarkdownV2(
	identifier: string,
	additionalState: string | undefined,
): string {
	// eslint-disable-next-line unicorn/prefer-string-replace-all
	const part = url(identifier, additionalState).replace(/\)/g, String.raw`\)`);
	return MARKDOWN_PREFIX + part + ')';
}

const HTML_SUFFIX = `">${URL_TEXT}</a>`;
export function suffixHTML(
	identifier: string,
	additionalState: string | undefined,
): string {
	return '<a href="' + url(identifier, additionalState) + HTML_SUFFIX;
}
