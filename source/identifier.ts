import {Context as TelegrafContext, NarrowedContext} from 'telegraf'
import {markdown, markdownv2, html} from 'telegram-format'
import {MessageEntity, Message, Update} from 'typegram'

const URL_TEXT = '\u200C'
const BASE_URL = 'http://t.me/#'
const URL_SEPERATOR = '#'

// ReplyMessage from typegram is not exported
type ReplyToMessage = NonNullable<Message.CommonMessage['reply_to_message']>

type MessageUpdateContext<Context extends TelegrafContext> = NarrowedContext<Context, Update.MessageUpdate>
export type ReplyToMessageContext<Context extends TelegrafContext> = MessageUpdateContext<Context> & {message: MessageUpdateContext<Context>['message'] & {reply_to_message: ReplyToMessage}}

export type UrlMessageEntity = Readonly<MessageEntity.TextLinkMessageEntity>

export function isContextReplyToMessage<Context extends TelegrafContext>(context: Context): context is ReplyToMessageContext<Context> {
	return Boolean(context.message && 'reply_to_message' in context.message)
}

function getRelevantEntity<Context extends TelegrafContext>(context: ReplyToMessageContext<Context>): UrlMessageEntity | undefined {
	const repliedTo = context.message.reply_to_message
	const entities: ReadonlyArray<Readonly<MessageEntity>> = ('entities' in repliedTo && repliedTo.entities) || ('caption_entities' in repliedTo && repliedTo.caption_entities) || []
	const relevantEntity = entities
		.slice(-1)
		.find((o): o is UrlMessageEntity => o.type === 'text_link')
	return relevantEntity
}

export function isReplyToQuestion<Context extends TelegrafContext>(context: ReplyToMessageContext<Context>, identifier: string): boolean {
	const relevantEntity = getRelevantEntity(context)
	const expectedUrl = url(identifier, undefined)
	return Boolean(relevantEntity?.url.startsWith(expectedUrl))
}

export function getAdditionalState<Context extends TelegrafContext>(context: ReplyToMessageContext<Context>, identifier: string): string {
	const relevantEntity = getRelevantEntity(context)!
	const expectedUrl = url(identifier, undefined)
	return relevantEntity.url.slice(expectedUrl.length)
}

function url(identifier: string, additionalState: string | undefined): string {
	return BASE_URL + identifier + URL_SEPERATOR + (additionalState ?? '')
}

export function suffixMarkdown(identifier: string, additionalState: string | undefined): string {
	return markdown.url(URL_TEXT, url(identifier, additionalState))
}

export function suffixMarkdownV2(identifier: string, additionalState: string | undefined): string {
	return markdownv2.url(URL_TEXT, url(identifier, additionalState))
}

export function suffixHTML(identifier: string, additionalState: string | undefined): string {
	return html.url(URL_TEXT, url(identifier, additionalState))
}
