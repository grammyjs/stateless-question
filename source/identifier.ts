import {Context as TelegrafContext} from 'telegraf'
import {markdown, markdownv2, html} from 'telegram-format'
import {MessageEntity} from 'telegraf/typings/telegram-types'

const URL_TEXT = '\u200C'
const BASE_URL = 'http://t.me/#'

export type ReplyToMessageContext<Context extends TelegrafContext> = Context & {message: NonNullable<TelegrafContext['message']> & {reply_to_message: NonNullable<NonNullable<TelegrafContext['message']>['reply_to_message']>}}

export function isReplyToQuestion<Context extends TelegrafContext>(ctx: Context, identifier: string): ctx is ReplyToMessageContext<Context> {
	const repliedTo = ctx.message?.reply_to_message
	if (!repliedTo) {
		return false
	}

	const entities: ReadonlyArray<Readonly<MessageEntity>> = repliedTo.entities ?? repliedTo.caption_entities ?? []
	const relevantEntity = entities
		.filter(o => o.type === 'text_link')
		.slice(-1)[0] as MessageEntity | undefined
	if (!relevantEntity?.url?.startsWith(BASE_URL)) {
		return false
	}

	const repliedToIdentifier = relevantEntity.url.slice(BASE_URL.length)
	return repliedToIdentifier === identifier
}

export function suffixMarkdown(identifier: string): string {
	return markdown.url(URL_TEXT, BASE_URL + identifier)
}

export function suffixMarkdownV2(identifier: string): string {
	return markdownv2.url(URL_TEXT, BASE_URL + identifier)
}

export function suffixHTML(identifier: string): string {
	return html.url(URL_TEXT, BASE_URL + identifier)
}
