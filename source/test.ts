import {deepStrictEqual, strictEqual, throws} from 'node:assert';
import {test} from 'node:test';
import {Bot, type Context as BaseContext} from 'grammy';
import {type AnswerFunction, StatelessQuestion} from './index.ts';

function shouldntBeCalled(): never {
	throw new Error('shouldnt be called');
}

await test('shouldntBeCalled works', () => {
	throws(shouldntBeCalled);
});

await test('uniqueIdentifier keeps the same', () => {
	const question = new StatelessQuestion('unicorns', shouldntBeCalled);

	strictEqual(question.uniqueIdentifier, 'unicorns');
});

await test('can replyWithMarkdown the question correctly', async t => {
	const question = new StatelessQuestion('unicorns', shouldntBeCalled);

	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const reply = t.mock.fn<BaseContext['reply']>(async (text, extra) => {
		strictEqual(text, 'banana' + question.messageSuffixMarkdown());
		deepStrictEqual(extra, {
			parse_mode: 'Markdown',
			reply_markup: {force_reply: true},
		});

		return {
			message_id: 42,
			date: 42,
			from: {id: 42, first_name: 'Bob', is_bot: true},
			chat: {id: 42, type: 'private', first_name: 'Bob'},
			text: '666',
		};
	});
	bot.use(async (ctx, next) => {
		ctx.reply = reply;
		return next();
	});

	bot.use(async ctx => question.replyWithMarkdown(ctx, 'banana'));
	await bot.handleUpdate({
		update_id: 42,
	});
	strictEqual(reply.mock.callCount(), 1);
});

await test('can replyWithMarkdownV2 the question correctly', async t => {
	const question = new StatelessQuestion('unicorns', shouldntBeCalled);

	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const reply = t.mock.fn<BaseContext['reply']>(async (text, extra) => {
		strictEqual(text, 'banana' + question.messageSuffixMarkdown());
		deepStrictEqual(extra, {
			parse_mode: 'MarkdownV2',
			reply_markup: {force_reply: true},
		});

		return {
			message_id: 42,
			date: 42,
			from: {id: 42, first_name: 'Bob', is_bot: true},
			chat: {id: 42, type: 'private', first_name: 'Bob'},
			text: '666',
		};
	});
	bot.use(async (ctx, next) => {
		ctx.reply = reply;
		return next();
	});

	bot.use(async ctx => question.replyWithMarkdownV2(ctx, 'banana'));
	await bot.handleUpdate({
		update_id: 42,
	});
	strictEqual(reply.mock.callCount(), 1);
});

await test('can replyWithHTML the question correctly', async t => {
	const question = new StatelessQuestion('unicorns', shouldntBeCalled);

	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const reply = t.mock.fn<BaseContext['reply']>(async (text, extra) => {
		strictEqual(text, 'banana' + question.messageSuffixHTML());
		deepStrictEqual(extra, {
			parse_mode: 'HTML',
			reply_markup: {force_reply: true},
		});

		return {
			message_id: 42,
			date: 42,
			from: {id: 42, first_name: 'Bob', is_bot: true},
			chat: {id: 42, type: 'private', first_name: 'Bob'},
			text: '666',
		};
	});
	bot.use(async (ctx, next) => {
		ctx.reply = reply;
		return next();
	});

	bot.use(async ctx => question.replyWithHTML(ctx, 'banana'));
	await bot.handleUpdate({
		update_id: 42,
	});
	strictEqual(reply.mock.callCount(), 1);
});

await test('ignores different update', async t => {
	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const question = new StatelessQuestion('unicorns', shouldntBeCalled);
	bot.use(question.middleware());

	const passes = t.mock.fn();
	bot.use(passes);

	await bot.handleUpdate({
		update_id: 42,
		callback_query: {
			id: '42',
			from: {id: 42, is_bot: false, first_name: 'Bob'},
			chat_instance: '42',
			data: '666',
		},
	});
	strictEqual(passes.mock.callCount(), 1);
});

await test('ignores different message', async t => {
	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const question = new StatelessQuestion('unicorns', shouldntBeCalled);
	bot.use(question.middleware());

	const passes = t.mock.fn();
	bot.use(passes);

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			from: {id: 42, first_name: 'Bob', is_bot: true},
			chat: {id: 42, type: 'private', first_name: 'Bob'},
			date: 42,
			text: 'unrelated',
		},
	});
	strictEqual(passes.mock.callCount(), 1);
});

await test('ignores message replying to something else', async t => {
	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const question = new StatelessQuestion('unicorns', shouldntBeCalled);
	bot.use(question.middleware());

	const passes = t.mock.fn();
	bot.use(passes);

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			from: {id: 42, first_name: 'Bob', is_bot: true},
			chat: {id: 42, type: 'private', first_name: 'Bob'},
			date: 42,
			text: 'unrelated',
			// @ts-expect-error missing some keys
			reply_to_message: {
				message_id: 43,
				from: {id: 42, first_name: 'Bob', is_bot: true},
				chat: {id: 42, type: 'private', first_name: 'Bob'},
				date: 10,
				text: 'whatever',
			},
		},
	});
	strictEqual(passes.mock.callCount(), 1);
});

await test('ignores message replying to something else with entities', async t => {
	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const question = new StatelessQuestion('unicorns', shouldntBeCalled);
	bot.use(question.middleware());

	const passes = t.mock.fn();
	bot.use(passes);

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			from: {id: 42, first_name: 'Bob', is_bot: true},
			chat: {id: 42, type: 'private', first_name: 'Bob'},
			date: 42,
			text: 'unrelated',
			// @ts-expect-error missing some keys
			reply_to_message: {
				message_id: 43,
				from: {id: 42, first_name: 'Bob', is_bot: true},
				chat: {id: 42, type: 'private', first_name: 'Bob'},
				date: 10,
				text: 'whatever',
				entities: [
					{
						type: 'text_link',
						url: 'http://t.me/EdJoPaTo',
						offset: 0,
						length: 2,
					},
				],
			},
		},
	});
	strictEqual(passes.mock.callCount(), 1);
});

await test('ignores message replying to another question', async t => {
	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const question = new StatelessQuestion('unicorns', shouldntBeCalled);
	bot.use(question.middleware());

	const passes = t.mock.fn();
	bot.use(passes);

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			from: {id: 42, first_name: 'Bob', is_bot: true},
			chat: {id: 42, type: 'private', first_name: 'Bob'},
			date: 42,
			text: 'unrelated',
			// @ts-expect-error missing some keys
			reply_to_message: {
				message_id: 43,
				from: {id: 42, first_name: 'Bob', is_bot: true},
				chat: {id: 42, type: 'private', first_name: 'Bob'},
				date: 10,
				text: 'whatever',
				entities: [
					{
						type: 'text_link',
						url: 'http://t.me/#other#',
						offset: 0,
						length: 2,
					},
				],
			},
		},
	});
	strictEqual(passes.mock.callCount(), 1);
});

await test('correctly works with text message', async t => {
	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const answer = t.mock.fn<AnswerFunction<BaseContext>>(ctx => {
		strictEqual(ctx.message.message_id, 42);
		strictEqual(ctx.message.reply_to_message.message_id, 43);
	});
	const question = new StatelessQuestion('unicorns', answer);
	bot.use(question.middleware());
	bot.use(shouldntBeCalled);

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			from: {id: 42, first_name: 'Bob', is_bot: true},
			chat: {id: 42, type: 'private', first_name: 'Bob'},
			date: 42,
			text: 'the answer',
			// @ts-expect-error missing some keys
			reply_to_message: {
				message_id: 43,
				from: {id: 42, first_name: 'Bob', is_bot: true},
				chat: {id: 42, type: 'private', first_name: 'Bob'},
				date: 10,
				text: 'whatever',
				entities: [
					{
						type: 'text_link',
						url: 'http://t.me/#unicorns#',
						offset: 0,
						length: 2,
					},
				],
			},
		},
	});
	strictEqual(answer.mock.callCount(), 1);
});

await test('correctly works with text message with additional state', async t => {
	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const answer = t.mock.fn<AnswerFunction<BaseContext>>((ctx, additionalState) => {
		strictEqual(ctx.message.message_id, 42);
		strictEqual(ctx.message.reply_to_message.message_id, 43);
		strictEqual(additionalState, 'explode');
	});
	const question = new StatelessQuestion('unicorns', answer);
	bot.use(question.middleware());
	bot.use(shouldntBeCalled);

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			from: {id: 42, first_name: 'Bob', is_bot: true},
			chat: {id: 42, type: 'private', first_name: 'Bob'},
			date: 42,
			text: 'the answer',
			// @ts-expect-error missing some keys
			reply_to_message: {
				message_id: 43,
				from: {id: 42, first_name: 'Bob', is_bot: true},
				chat: {id: 42, type: 'private', first_name: 'Bob'},
				date: 10,
				text: 'whatever',
				entities: [
					{
						type: 'text_link',
						url: 'http://t.me/#unicorns#explode',
						offset: 0,
						length: 2,
					},
				],
			},
		},
	});
	strictEqual(answer.mock.callCount(), 1);
});

await test('additional state url encoding is removed before passed to function', async t => {
	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const answer = t.mock.fn<AnswerFunction<BaseContext>>((ctx, additionalState) => {
		strictEqual(ctx.message.message_id, 42);
		strictEqual(ctx.message.reply_to_message.message_id, 43);
		strictEqual(additionalState, 'foo bar/');
	});
	const question = new StatelessQuestion('unicorns', answer);
	bot.use(question.middleware());
	bot.use(shouldntBeCalled);

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			from: {id: 42, first_name: 'Bob', is_bot: true},
			chat: {id: 42, type: 'private', first_name: 'Bob'},
			date: 42,
			text: 'the answer',
			// @ts-expect-error missing some keys
			reply_to_message: {
				message_id: 43,
				from: {id: 42, first_name: 'Bob', is_bot: true},
				chat: {id: 42, type: 'private', first_name: 'Bob'},
				date: 10,
				text: 'whatever',
				entities: [
					{
						type: 'text_link',
						url: 'http://t.me/#unicorns#foo%20bar%2F',
						offset: 0,
						length: 2,
					},
				],
			},
		},
	});
	strictEqual(answer.mock.callCount(), 1);
});

await test('correctly works with media message', async t => {
	const bot = new Bot('123:ABC');
	(bot as any).botInfo = {};
	const answer = t.mock.fn<AnswerFunction<BaseContext>>(ctx => {
		strictEqual(ctx.message.message_id, 42);
		strictEqual(ctx.message.reply_to_message.message_id, 43);
	});
	const question = new StatelessQuestion('unicorns', answer);
	bot.use(question.middleware());
	bot.use(shouldntBeCalled);

	await bot.handleUpdate({
		update_id: 42,
		message: {
			message_id: 42,
			from: {id: 42, first_name: 'Bob', is_bot: true},
			chat: {id: 42, type: 'private', first_name: 'Bob'},
			date: 42,
			text: 'the answer',
			// @ts-expect-error missing some keys
			reply_to_message: {
				message_id: 43,
				from: {id: 42, first_name: 'Bob', is_bot: true},
				chat: {id: 42, type: 'private', first_name: 'Bob'},
				date: 10,
				photo: [],
				caption: 'whatever',
				caption_entities: [
					{
						type: 'text_link',
						url: 'http://t.me/#unicorns#',
						offset: 0,
						length: 2,
					},
				],
			},
		},
	});
	strictEqual(answer.mock.callCount(), 1);
});
