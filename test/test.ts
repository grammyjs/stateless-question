import test from 'ava'
import Telegraf from 'telegraf'

import TelegrafStatelessQuestion from '../source'

test('uniqueIdentifier keeps the same', t => {
	const question = new TelegrafStatelessQuestion('unicorns', () => {
		t.pass()
	})

	t.is(question.uniqueIdentifier, 'unicorns')
})

test('messageSuffixMarkdown', t => {
	const question = new TelegrafStatelessQuestion('unicorns', () => {
		t.pass()
	})

	t.is(question.messageSuffixMarkdown, '[\u200C](http://t.me/#unicorns)')
})

test('messageSuffixHTML', t => {
	const question = new TelegrafStatelessQuestion('unicorns', () => {
		t.pass()
	})

	t.is(question.messageSuffixHTML, '<a href="http://t.me/#unicorns">\u200C</a>')
})

test('can replyWithMarkdown the question correctly', async t => {
	const question = new TelegrafStatelessQuestion('unicorns', () => {
		t.fail()
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('expect replyWithMarkdown')
		throw new Error('expect replyWithMarkdown')
	}

	bot.context.replyWithHTML = () => {
		t.fail('expect replyWithMarkdown')
		throw new Error('expect replyWithMarkdown')
	}

	bot.context.replyWithMarkdown = async (text, extra) => {
		t.is(text, 'banana' + question.messageSuffixMarkdown)
		t.deepEqual(extra?.reply_markup, {
			force_reply: true
		})

		return {
			message_id: 42,
			date: 42,
			chat: {id: 42, type: 'private'}
		}
	}

	bot.use(async ctx => question.replyWithMarkdown(ctx, 'banana'))
	await bot.handleUpdate({
		update_id: 42
	})
})

test('can replyWithHTML the question correctly', async t => {
	const question = new TelegrafStatelessQuestion('unicorns', () => {
		t.fail()
	})

	const bot = new Telegraf('')
	bot.context.reply = () => {
		t.fail('expect replyWithHTML')
		throw new Error('expect replyWithHTML')
	}

	bot.context.replyWithMarkdown = () => {
		t.fail('expect replyWithHTML')
		throw new Error('expect replyWithHTML')
	}

	bot.context.replyWithHTML = async (text, extra) => {
		t.is(text, 'banana' + question.messageSuffixHTML)
		t.deepEqual(extra?.reply_markup, {
			force_reply: true
		})

		return {
			message_id: 42,
			date: 42,
			chat: {id: 42, type: 'private'}
		}
	}

	bot.use(async ctx => question.replyWithHTML(ctx, 'banana'))
	await bot.handleUpdate({
		update_id: 42
	})
})

test('ignores different update', async t => {
	const bot = new Telegraf('')
	const question = new TelegrafStatelessQuestion('unicorns', () => {
		t.fail()
	})
	bot.use(question.middleware())
	bot.use(() => {
		t.pass()
	})

	await bot.handleUpdate({
		update_id: 42,
		callback_query: {
			id: '42',
			from: {id: 42, is_bot: false, first_name: 'Bob'},
			chat_instance: '42'
		}
	})
})

test('ignores different message', async t => {
	const bot = new Telegraf('')
	const question = new TelegrafStatelessQuestion('unicorns', () => {
		t.fail()
	})
	bot.use(question.middleware())
	bot.use(() => {
		t.pass()
	})

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			chat: {id: 42, type: 'private'},
			date: 42
		}
	})
})

test('ignores message replying to something else', async t => {
	const bot = new Telegraf('')
	const question = new TelegrafStatelessQuestion('unicorns', () => {
		t.fail()
	})
	bot.use(question.middleware())
	bot.use(() => {
		t.pass()
	})

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			chat: {id: 42, type: 'private'},
			date: 42,
			reply_to_message: {
				message_id: 43,
				chat: {id: 42, type: 'private'},
				date: 10,
				text: 'whatever'
			}
		}
	})
})

test('ignores message replying to something else with entities', async t => {
	const bot = new Telegraf('')
	const question = new TelegrafStatelessQuestion('unicorns', () => {
		t.fail()
	})
	bot.use(question.middleware())
	bot.use(() => {
		t.pass()
	})

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			chat: {id: 42, type: 'private'},
			date: 42,
			reply_to_message: {
				message_id: 43,
				chat: {id: 42, type: 'private'},
				date: 10,
				text: 'whatever',
				entities: [{
					type: 'text_link',
					url: 'http://t.me/EdJoPaTo',
					offset: 0,
					length: 2
				}]
			}
		}
	})
})

test('ignores message replying to another question', async t => {
	const bot = new Telegraf('')
	const question = new TelegrafStatelessQuestion('unicorns', () => {
		t.fail()
	})
	bot.use(question.middleware())
	bot.use(() => {
		t.pass()
	})

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			chat: {id: 42, type: 'private'},
			date: 42,
			reply_to_message: {
				message_id: 43,
				chat: {id: 42, type: 'private'},
				date: 10,
				text: 'whatever',
				entities: [{
					type: 'text_link',
					url: 'http://t.me/#other',
					offset: 0,
					length: 2
				}]
			}
		}
	})
})

test('correctly works with text message', async t => {
	const bot = new Telegraf('')
	const question = new TelegrafStatelessQuestion('unicorns', ctx => {
		t.is(ctx.message.message_id, 42)
		t.is(ctx.message.reply_to_message.message_id, 43)
	})
	bot.use(question.middleware())
	bot.use(() => {
		t.fail()
	})

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			chat: {id: 42, type: 'private'},
			date: 42,
			reply_to_message: {
				message_id: 43,
				chat: {id: 42, type: 'private'},
				date: 10,
				text: 'whatever',
				entities: [{
					type: 'text_link',
					url: 'http://t.me/#unicorns',
					offset: 0,
					length: 2
				}]
			}
		}
	})
})

test('correctly works with media message', async t => {
	const bot = new Telegraf('')
	const question = new TelegrafStatelessQuestion('unicorns', ctx => {
		t.is(ctx.message.message_id, 42)
		t.is(ctx.message.reply_to_message.message_id, 43)
	})
	bot.use(question.middleware())
	bot.use(() => {
		t.fail()
	})

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			chat: {id: 42, type: 'private'},
			date: 42,
			reply_to_message: {
				message_id: 43,
				chat: {id: 42, type: 'private'},
				date: 10,
				photo: [],
				caption: 'whatever',
				caption_entities: [{
					type: 'text_link',
					url: 'http://t.me/#unicorns',
					offset: 0,
					length: 2
				}]
			}
		}
	})
})
