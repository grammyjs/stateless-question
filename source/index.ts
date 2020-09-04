import {Context as TelegrafContext, Middleware} from 'telegraf'
import {Message} from 'telegraf/typings/telegram-types'

import {suffixHTML, suffixMarkdown, suffixMarkdownV2, isReplyToQuestion, ReplyToMessageContext} from './identifier'

type ConstOrPromise<T> = T | Promise<T>
type ContextFunc<Context, ReturnType> = (context: Context) => ConstOrPromise<ReturnType>

export default class TelegrafStatelessQuestion<Context extends TelegrafContext> {
	public readonly messageSuffixHTML: string
	public readonly messageSuffixMarkdown: string
	public readonly messageSuffixMarkdownV2: string

	constructor(
		public readonly uniqueIdentifier: string,
		private readonly answer: ContextFunc<ReplyToMessageContext<Context>, void>
	) {
		this.messageSuffixHTML = suffixHTML(uniqueIdentifier)
		this.messageSuffixMarkdown = suffixMarkdown(uniqueIdentifier)
		this.messageSuffixMarkdownV2 = suffixMarkdownV2(uniqueIdentifier)
	}

	middleware(): Middleware<Context> {
		return async (context, next) => {
			if (isReplyToQuestion(context, this.uniqueIdentifier)) {
				return this.answer(context)
			}

			await next()
		}
	}

	async replyWithHTML(context: TelegrafContext, text: string): Promise<Message> {
		const textResult = text + this.messageSuffixHTML
		return context.reply(textResult, {reply_markup: {force_reply: true}, parse_mode: 'HTML'})
	}

	async replyWithMarkdown(context: TelegrafContext, text: string): Promise<Message> {
		const textResult = text + this.messageSuffixMarkdown
		return context.reply(textResult, {reply_markup: {force_reply: true}, parse_mode: 'Markdown'})
	}

	async replyWithMarkdownV2(context: TelegrafContext, text: string): Promise<Message> {
		const textResult = text + this.messageSuffixMarkdownV2
		return context.reply(textResult, {reply_markup: {force_reply: true}, parse_mode: 'MarkdownV2'})
	}
}

// For CommonJS default export support
/* eslint @typescript-eslint/no-unsafe-member-access: off */
module.exports = TelegrafStatelessQuestion
module.exports.default = TelegrafStatelessQuestion
