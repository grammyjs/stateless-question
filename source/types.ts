interface Extra {
	readonly parse_mode: 'HTML' | 'Markdown' | 'MarkdownV2';
	readonly reply_markup: {
		readonly force_reply: true;
	};
}

export interface UrlMessageEntity {
	readonly type: 'text_link';
	readonly url: string;
}

export interface ReplyToMessage {
	readonly entities?: unknown[];
	readonly caption_entities?: unknown[];
}

export interface MessageWithReplyTo {
	readonly reply_to_message: ReplyToMessage;
}

export interface ContextInReplyTo {
	readonly message: MessageWithReplyTo;
}

export interface ContextWithMessage {
	readonly message: unknown;
}

export interface ContextWithReply<Message> {
	readonly reply: (text: string, extra: Extra) => Promise<Message>;
}

export type MiddlewareFn<Context> = (ctx: Context, next: () => Promise<void>) => Promise<void>

export function isUrlMessageEntity(entity: unknown): entity is UrlMessageEntity {
	return typeof entity === 'object' && entity !== null &&
		hasProperty(entity, 'type') && hasProperty(entity, 'url') &&
		entity.type === 'text_link' && typeof entity.url === 'string'
}

export function hasReplyToMessage(message: unknown): message is MessageWithReplyTo {
	if (typeof message === 'object' && message !== null && hasProperty(message, 'reply_to_message')) {
		const r = message.reply_to_message
		return typeof r === 'object' && r !== null
	}

	return false
}

function hasProperty<P extends PropertyKey>(object: unknown, prop: P): object is Record<P, unknown> {
	return typeof object === 'object' && object !== null && prop in object
}
