import type {Context as BaseContext} from 'grammy';
import {
  getAdditionalState,
  isContextReplyToMessage,
  isReplyToQuestion,
  type ReplyToMessageContext,
  suffixHTML,
  suffixMarkdown,
  suffixMarkdownV2,
} from './identifier.js';

type ConstOrPromise<T> = T | Promise<T>;

export class StatelessQuestion<Context extends BaseContext> {
  constructor(
    public readonly uniqueIdentifier: string,
    private readonly answer: (
      context: ReplyToMessageContext<Context>,
      additionalState: string,
    ) => ConstOrPromise<void>,
  ) {}

  middleware(): (context: Context, next: () => Promise<void>) => Promise<void> {
    return async (context, next) => {
      if (
        isContextReplyToMessage(context)
        && isReplyToQuestion(context, this.uniqueIdentifier)
      ) {
        const additionalState = getAdditionalState(
          context,
          this.uniqueIdentifier,
        );
        return this.answer(context, additionalState);
      }

      await next();
    };
  }

  messageSuffixHTML(additionalState?: string): string {
    return suffixHTML(this.uniqueIdentifier, additionalState);
  }

  messageSuffixMarkdown(additionalState?: string): string {
    return suffixMarkdown(this.uniqueIdentifier, additionalState);
  }

  messageSuffixMarkdownV2(additionalState?: string): string {
    return suffixMarkdownV2(this.uniqueIdentifier, additionalState);
  }

  async replyWithHTML(
    context: BaseContext,
    text: string,
    additionalState?: string,
  ) {
    const textResult = text + this.messageSuffixHTML(additionalState);
    return context.reply(textResult, {
      reply_markup: {force_reply: true},
      parse_mode: 'HTML',
    });
  }

  async replyWithMarkdown(
    context: BaseContext,
    text: string,
    additionalState?: string,
  ) {
    const textResult = text + this.messageSuffixMarkdown(additionalState);
    return context.reply(textResult, {
      reply_markup: {force_reply: true},
      parse_mode: 'Markdown',
    });
  }

  async replyWithMarkdownV2(
    context: BaseContext,
    text: string,
    additionalState?: string,
  ) {
    const textResult = text + this.messageSuffixMarkdownV2(additionalState);
    return context.reply(textResult, {
      reply_markup: {force_reply: true},
      parse_mode: 'MarkdownV2',
    });
  }
}
