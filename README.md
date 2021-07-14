# Stateless Question

> Create stateless questions to Telegram users working in privacy mode

You want to keep the privacy of the user with [Telegrams privacy mode enabled (by default)](https://core.telegram.org/bots#privacy-mode), send users translated questions in their language and don't save the state what users are currently doing?

This library wants to solve this problem.

The basic idea is to send your question with a [special text](https://en.wikipedia.org/wiki/Zero-width_non-joiner) at the end.
This text is invisible to the user but still visible for your bot.
When the user replies to a message the message is checked.
If it is containing this special text at the end it is an answer to the question.
This way you can have many strings for the same questions as when having translations.
You only have to make sure the `uniqueIdentifier` is unique within your bot.

Special thanks to [@Ramin-Bateni](https://github.com/Ramin-Bateni) and take a look on [his explanation](https://github.com/EdJoPaTo/telegraf-inline-menu/issues/44#issuecomment-541063654) how this works if you like.


## Install

```
$ npm install grammy @grammyjs/stateless-question
```


## Usage

```ts
import {StatelessQuestion} from '@grammyjs/stateless-question';

const bot = new Bot(token);

const unicornQuestion = new StatelessQuestion('unicorns', ctx => {
	console.log('User thinks unicorns are doing:', ctx.message)
})

// Dont forget to use the middleware
bot.use(unicornQuestion.middleware())

bot.command('rainbows', async ctx => {
	let text
	if (ctx.session.language === 'de') {
		text = 'Was machen Einhörner?'
	} else {
		text = 'What are unicorns doing?'
	}

	return unicornQuestion.replyWithMarkdown(ctx, text)
})

// Or send your question manually (make sure to use a parse_mode and force_reply!)
bot.command('unicorn', async ctx => ctx.replyWithMarkdown('What are unicorns doing?' + unicornQuestion.messageSuffixMarkdown(), {parse_mode: 'Markdown', reply_markup: {force_reply: true}})
bot.command('unicorn', async ctx => ctx.replyWithHTML(    'What are unicorns doing?' + unicornQuestion.messageSuffixHTML(),     {parse_mode: 'HTML',     reply_markup: {force_reply: true}})
```

### Additional State

When your question is specific for a certain topic then you can use the `additionalState` to remember that stateless with the message.
For example when you want to know in which room an event is happening you can set the event as `additionalState`.
This also helpful when working with [telegraf-inline-menu](https://github.com/EdJoPaTo/telegraf-inline-menu) to store the path to return the menu to.

```js
const locationQuestion = new StatelessQuestion('target', (ctx, additionalState) => {
	console.log('Location of', additionalState, 'is', ctx.message.text)
	saveHeroLocation(additionalState, ctx.message.text)
})

// Dont forget to use the middleware
bot.use(locationQuestion.middleware())

bot.command('batman', async ctx => {
	return locationQuestion.replyWithMarkdown(ctx, 'Where is Batman?', 'batman')
})

bot.command('superman', async ctx => {
	return locationQuestion.replyWithMarkdown(ctx, 'Where is superman?', 'superman')
})
```

### `selective` `ForceReply`

When using in groups in might be nice to only request a reply from the user starting the question.
Telegram provides `selected` as an option for the [ForceReply](https://core.telegram.org/bots/api#forcereply).

In order to make `selected` work you need to reply to a message (`reply_to_message_id`) or need to mention the user(s) which should reply to this.

```ts
await ctx.replyWithHTML(
	'What are unicorns doing?' + unicornQuestion.messageSuffixHTML(),
	{
		parse_mode: 'HTML',
		reply_to_message_id: ctx.message.message_id,
		reply_markup: {
			force_reply: true,
			selective: true
		}
	}
)
```

## Known Issues

### The ForceReply question is always shown in some Telegram Clients even long after the question has already answered

see [#4](https://github.com/EdJoPaTo/telegraf-stateless-question/issues/4)

As of the design choices Telegram made to create ForceReply it's hard for a Telegram Client to know if a question is still relevant or not.
As a workaround we can send [ReplyKeyboardRemove](https://core.telegram.org/bots/api#replykeyboardremove) as `reply_markup` with messages that do not require any other `reply_markup` (only one is possible for a message).

```ts
const unicornQuestion = new StatelessQuestion('unicorns', async ctx => {
	console.log('User thinks unicorns are doing:', ctx.message)
	await ctx.reply('if you think so...', {reply_markup: {remove_keyboard: true}})
})
```

### Sending an abort/back (inline) button with the question message

see [#1](https://github.com/EdJoPaTo/telegraf-stateless-question/issues/1)

Telegram allows only one `reply_markup` at a time.
As this library relies on replies to a message [ForceReply](https://core.telegram.org/bots/api#forcereply) is already used as the `reply_markup`.
In order to send an (inline) button with the same message it would require an (inline) keyboard markup.
That would be a second `reply_markup` which Telegram sadly does not support.
