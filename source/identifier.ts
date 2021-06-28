import {markdown, markdownv2, html} from 'telegram-format'

import {ContextInReplyTo, ContextWithMessage, hasReplyToMessage, isUrlMessageEntity, UrlMessageEntity} from './types.js'

const URL_TEXT = '\u200C'
const BASE_URL = 'http://t.me/#'
const URL_SEPERATOR = '#'

function getRelevantEntity(context: ContextWithMessage): UrlMessageEntity | undefined {
	const {message} = context
	if (!hasReplyToMessage(message)) {
		return undefined
	}

	const repliedTo = message.reply_to_message
	const entities = ('entities' in repliedTo && repliedTo.entities) || ('caption_entities' in repliedTo && repliedTo.caption_entities) || []
	const relevantEntity = entities
		.slice(-1)
		// eslint-disable-next-line unicorn/no-array-callback-reference
		.find(isUrlMessageEntity)
	return relevantEntity
}

export function isReplyToQuestion(context: ContextWithMessage, identifier: string): context is ContextInReplyTo {
	const relevantEntity = getRelevantEntity(context)
	const expectedUrl = url(identifier, undefined)
	return Boolean(relevantEntity?.url.startsWith(expectedUrl))
}

export function getAdditionalState(context: ContextWithMessage, identifier: string): string {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const relevantEntity = getRelevantEntity(context)!
	const expectedUrl = url(identifier, undefined)
	const part = relevantEntity.url.slice(expectedUrl.length)
	return decodeURI(part)
}

function url(identifier: string, additionalState: string | undefined): string {
	return encodeURI(BASE_URL + identifier + URL_SEPERATOR + (additionalState ?? ''))
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
