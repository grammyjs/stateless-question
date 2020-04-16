# telegraf-stateless-question

[![NPM Version](https://img.shields.io/npm/v/telegraf-stateless-question.svg)](https://www.npmjs.com/package/telegraf-stateless-question)
[![node](https://img.shields.io/node/v/telegraf-stateless-question.svg)](https://www.npmjs.com/package/telegraf-stateless-question)
[![Build Status](https://travis-ci.com/EdJoPaTo/telegraf-stateless-question.svg?branch=master)](https://travis-ci.com/EdJoPaTo/telegraf-stateless-question)
[![Dependency Status](https://david-dm.org/EdJoPaTo/telegraf-stateless-question/status.svg)](https://david-dm.org/EdJoPaTo/telegraf-stateless-question)
[![Peer Dependency Status](https://david-dm.org/EdJoPaTo/telegraf-stateless-question/peer-status.svg)](https://david-dm.org/EdJoPaTo/telegraf-inline-menu?type=peer)
[![Dev Dependency Status](https://david-dm.org/EdJoPaTo/telegraf-stateless-question/dev-status.svg)](https://david-dm.org/EdJoPaTo/telegraf-stateless-question?type=dev)

> Create stateless questions to Telegram users working in privacy mode

You want to keep the privacy of the user with [Telegrams privacy mode enabled (by default)](https://core.telegram.org/bots#privacy-mode), send users translated questions in their language and dont save the state what users are currently doing?

This library wants to solve this problem.

The basic idea is to send your question with a [special text](https://en.wikipedia.org/wiki/Zero-width_non-joiner) at the end.
This text is invisible to the user but still visible for your bot.
When the user replies to a message the message is checked.
If it is containing this special text at the end it is an answer to the question.
This way you can have many different strings for the same questions like when having translations.
You only have to make sure the uniqueIdentifier is unique within your bot.

Special thanks to [@Ramin-Bateni](https://github.com/Ramin-Bateni) and take a look on [his explanation](https://github.com/EdJoPaTo/telegraf-inline-menu/issues/44#issuecomment-541063654) how this works if you like.


## Install

```
$ npm install telegraf telegraf-stateless-question
```


## Usage

```js
const TelegrafStatelessQuestion = require('telegraf-stateless-question');

const bot = new Telegraf(token);

const unicornQuestion = new TelegrafStatelessQuestion('unicorns', ctx => {
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

	return unicornQuestion.replyWithMarkdown(text)
})

// Or send your question manually (make sure to use Markdown or HTML and forceReply!)
bot.command('unicorn', async ctx => ctx.replyWithMarkdown('What are unicorns doing?' + unicornQuestion.messageSuffixMarkdown, Extra.markdown().markup(Markup.forceReply()))
bot.command('unicorn', async ctx => ctx.replyWithHTML(    'What are unicorns doing?' + unicornQuestion.messageSuffixHTML,     Extra.markdown().markup(Markup.forceReply()))
```
