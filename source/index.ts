import {Context as TelegrafContext, Middleware, Extra, Markup} from 'telegraf'
import {Message} from 'telegraf/typings/telegram-types'

import {suffixHTML, suffixMarkdown, isReplyToQuestion, ReplyToMessageContext} from './identifier'

type ConstOrPromise<T> = T | Promise<T>
type ContextFunc<Context, ReturnType> = (context: Context) => ConstOrPromise<ReturnType>

export default class TelegrafStatelessQuestion<Context extends TelegrafContext> {
	public readonly messageSuffixHTML: string
	public readonly messageSuffixMarkdown: string

	constructor(
		public readonly uniqueIdentifier: string,
		private readonly _answer: ContextFunc<ReplyToMessageContext<Context>, void>
	) {
		this.messageSuffixHTML = suffixHTML(uniqueIdentifier)
		this.messageSuffixMarkdown = suffixMarkdown(uniqueIdentifier)
	}

	middleware(): Middleware<Context> {
		return async (context, next) => {
			if (isReplyToQuestion(context, this.uniqueIdentifier)) {
				return this._answer(context)
			}

			await next?.()
		}
	}

	async replyWithHTML(context: TelegrafContext, text: string): Promise<Message> {
		const textResult = text + this.messageSuffixHTML
		return context.replyWithHTML(textResult, Extra.markup(Markup.forceReply()))
	}

	async replyWithMarkdown(context: TelegrafContext, text: string): Promise<Message> {
		const textResult = text + this.messageSuffixMarkdown
		return context.replyWithMarkdown(textResult, Extra.markup(Markup.forceReply()))
	}
}

// For CommonJS default export support
/* eslint @typescript-eslint/no-unsafe-member-access: off */
module.exports = TelegrafStatelessQuestion
module.exports.default = TelegrafStatelessQuestion
