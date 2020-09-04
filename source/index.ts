import {Context as TelegrafContext, Middleware} from 'telegraf'
import {Message} from 'telegraf/typings/telegram-types'

import {suffixHTML, suffixMarkdown, suffixMarkdownV2, isContextReplyToMessage, isReplyToQuestion, ReplyToMessageContext} from './identifier'

type ConstOrPromise<T> = T | Promise<T>

export default class TelegrafStatelessQuestion<Context extends TelegrafContext> {
	constructor(
		public readonly uniqueIdentifier: string,
		private readonly answer: (context: ReplyToMessageContext<Context>) => ConstOrPromise<void>
	) {}

	middleware(): Middleware<Context> {
		return async (context, next) => {
			if (isContextReplyToMessage(context) && isReplyToQuestion(context, this.uniqueIdentifier)) {
				return this.answer(context)
			}

			await next()
		}
	}

	async replyWithHTML(context: TelegrafContext, text: string): Promise<Message> {
		const textResult = text + suffixHTML(this.uniqueIdentifier)
		return context.reply(textResult, {reply_markup: {force_reply: true}, parse_mode: 'HTML'})
	}

	async replyWithMarkdown(context: TelegrafContext, text: string): Promise<Message> {
		const textResult = text + suffixMarkdown(this.uniqueIdentifier)
		return context.reply(textResult, {reply_markup: {force_reply: true}, parse_mode: 'Markdown'})
	}

	async replyWithMarkdownV2(context: TelegrafContext, text: string): Promise<Message> {
		const textResult = text + suffixMarkdownV2(this.uniqueIdentifier)
		return context.reply(textResult, {reply_markup: {force_reply: true}, parse_mode: 'MarkdownV2'})
	}
}

// For CommonJS default export support
/* eslint @typescript-eslint/no-unsafe-member-access: off */
module.exports = TelegrafStatelessQuestion
module.exports.default = TelegrafStatelessQuestion
