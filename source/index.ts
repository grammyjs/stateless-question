import {Context as TelegrafContext, MiddlewareFn} from 'telegraf'
import {Message} from 'typegram'

import {suffixHTML, suffixMarkdown, suffixMarkdownV2, isContextReplyToMessage, isReplyToQuestion, ReplyToMessageContext, getAdditionalState} from './identifier'

type ConstOrPromise<T> = T | Promise<T>

export default class TelegrafStatelessQuestion<Context extends TelegrafContext> {
	constructor(
		public readonly uniqueIdentifier: string,
		private readonly answer: (context: ReplyToMessageContext<Context>, additionalState: string) => ConstOrPromise<void>,
	) {}

	middleware(): MiddlewareFn<Context> {
		return async (context, next) => {
			if (isContextReplyToMessage(context) && isReplyToQuestion(context, this.uniqueIdentifier)) {
				const additionalState = getAdditionalState(context, this.uniqueIdentifier)
				return this.answer(context, additionalState)
			}

			await next()
		}
	}

	messageSuffixHTML(additionalState?: string): string {
		return suffixHTML(this.uniqueIdentifier, additionalState)
	}

	messageSuffixMarkdown(additionalState?: string): string {
		return suffixMarkdown(this.uniqueIdentifier, additionalState)
	}

	messageSuffixMarkdownV2(additionalState?: string): string {
		return suffixMarkdownV2(this.uniqueIdentifier, additionalState)
	}

	async replyWithHTML(context: TelegrafContext, text: string, additionalState?: string): Promise<Message> {
		const textResult = text + this.messageSuffixHTML(additionalState)
		return context.reply(textResult, {reply_markup: {force_reply: true}, parse_mode: 'HTML'})
	}

	async replyWithMarkdown(context: TelegrafContext, text: string, additionalState?: string): Promise<Message> {
		const textResult = text + this.messageSuffixMarkdown(additionalState)
		return context.reply(textResult, {reply_markup: {force_reply: true}, parse_mode: 'Markdown'})
	}

	async replyWithMarkdownV2(context: TelegrafContext, text: string, additionalState?: string): Promise<Message> {
		const textResult = text + this.messageSuffixMarkdownV2(additionalState)
		return context.reply(textResult, {reply_markup: {force_reply: true}, parse_mode: 'MarkdownV2'})
	}
}

// For CommonJS default export support
/* eslint-disable unicorn/prefer-module, @typescript-eslint/no-unsafe-member-access */
module.exports = TelegrafStatelessQuestion
module.exports.default = TelegrafStatelessQuestion
/* eslint-enable */
