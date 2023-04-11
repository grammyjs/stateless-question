import {
  type Context as BaseContext,
  html,
  markdown,
  markdownv2,
  type Message,
  type MessageEntity,
} from "./deps.deno.ts";

const URL_TEXT = "\u200C";
const BASE_URL = "http://t.me/#";
const URL_SEPERATOR = "#";

type ReplyToMessage = NonNullable<Message.CommonMessage["reply_to_message"]>;
export type ReplyToMessageContext<Context extends BaseContext> = Context & {
  message: Message.CommonMessage & { reply_to_message: ReplyToMessage };
};
export type UrlMessageEntity = Readonly<MessageEntity.TextLinkMessageEntity>;

export function isContextReplyToMessage<Context extends BaseContext>(
  context: Context,
): context is ReplyToMessageContext<Context> {
  return Boolean(context.message?.reply_to_message);
}

function getRelevantEntity<Context extends BaseContext>(
  context: ReplyToMessageContext<Context>,
): UrlMessageEntity | undefined {
  const repliedTo = context.message.reply_to_message;
  const entities: ReadonlyArray<Readonly<MessageEntity>> = repliedTo.entities ??
    repliedTo.caption_entities ?? [];
  const relevantEntity = entities.slice(-1)
    .find((o): o is UrlMessageEntity => o.type === "text_link");
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
  return decodeURI(part);
}

function url(identifier: string, additionalState: string | undefined): string {
  return encodeURI(
    BASE_URL + identifier + URL_SEPERATOR + (additionalState ?? ""),
  );
}

export function suffixMarkdown(
  identifier: string,
  additionalState: string | undefined,
): string {
  return markdown.url(URL_TEXT, url(identifier, additionalState));
}

export function suffixMarkdownV2(
  identifier: string,
  additionalState: string | undefined,
): string {
  return markdownv2.url(URL_TEXT, url(identifier, additionalState));
}

export function suffixHTML(
  identifier: string,
  additionalState: string | undefined,
): string {
  return html.url(URL_TEXT, url(identifier, additionalState));
}
