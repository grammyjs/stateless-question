import test from 'ava';
import {Bot} from 'grammy';

import {
  suffixHTML,
  suffixMarkdown,
  suffixMarkdownV2,
} from '../source/identifier.js';
import {StatelessQuestion} from '../source/index.js';

test('uniqueIdentifier keeps the same', t => {
  const question = new StatelessQuestion('unicorns', () => {
    t.pass();
  });

  t.is(question.uniqueIdentifier, 'unicorns');
});

test('messageSuffixMarkdown', t => {
  t.is(
    suffixMarkdown('unicorns', undefined),
    '[\u200C](http://t.me/#unicorns#)',
  );
});

test('messageSuffixMarkdown with additional state', t => {
  t.is(
    suffixMarkdown('unicorns', 'explode'),
    '[\u200C](http://t.me/#unicorns#explode)',
  );
});

test('messageSuffixMarkdown additional state gets url encoded correctly', t => {
  t.is(
    suffixMarkdown('unicorns', 'foo bar'),
    '[\u200C](http://t.me/#unicorns#foo%20bar)',
  );
});

test('messageSuffixMarkdownV2', t => {
  t.is(
    suffixMarkdownV2('unicorns', undefined),
    '[\u200C](http://t.me/#unicorns#)',
  );
});

test('messageSuffixMarkdownV2 with additional state', t => {
  t.is(
    suffixMarkdownV2('unicorns', 'explode'),
    '[\u200C](http://t.me/#unicorns#explode)',
  );
});

test('messageSuffixMarkdownV2 additional state gets url encoded correctly', t => {
  t.is(
    suffixMarkdownV2('unicorns', 'foo bar'),
    '[\u200C](http://t.me/#unicorns#foo%20bar)',
  );
});

test('messageSuffixHTML', t => {
  t.is(
    suffixHTML('unicorns', undefined),
    '<a href="http://t.me/#unicorns#">\u200C</a>',
  );
});

test('messageSuffixHTML with additional state', t => {
  t.is(
    suffixHTML('unicorns', 'explode'),
    '<a href="http://t.me/#unicorns#explode">\u200C</a>',
  );
});

test('messageSuffixHTML additional state gets url encoded correctly', t => {
  t.is(
    suffixHTML('unicorns', 'foo bar'),
    '<a href="http://t.me/#unicorns#foo%20bar">\u200C</a>',
  );
});

test('can replyWithMarkdown the question correctly', async t => {
  const question = new StatelessQuestion('unicorns', () => {
    t.fail();
  });

  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  bot.use(async (ctx, next) => {
    ctx.reply = async (text, extra) => {
      t.is(text, 'banana' + question.messageSuffixMarkdown());
      t.deepEqual(extra, {
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
    };

    return next();
  });

  bot.use(async ctx => question.replyWithMarkdown(ctx, 'banana'));
  await bot.handleUpdate({
    update_id: 42,
  } as any);
});

test('can replyWithMarkdownV2 the question correctly', async t => {
  const question = new StatelessQuestion('unicorns', () => {
    t.fail();
  });

  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  bot.use(async (ctx, next) => {
    ctx.reply = async (text, extra) => {
      t.is(text, 'banana' + question.messageSuffixMarkdown());
      t.deepEqual(extra, {
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
    };

    return next();
  });

  bot.use(async ctx => question.replyWithMarkdownV2(ctx, 'banana'));
  await bot.handleUpdate({
    update_id: 42,
  } as any);
});

test('can replyWithHTML the question correctly', async t => {
  const question = new StatelessQuestion('unicorns', () => {
    t.fail();
  });

  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  bot.use(async (ctx, next) => {
    ctx.reply = async (text, extra) => {
      t.is(text, 'banana' + question.messageSuffixHTML());
      t.deepEqual(extra, {
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
    };

    return next();
  });

  bot.use(async ctx => question.replyWithHTML(ctx, 'banana'));
  await bot.handleUpdate({
    update_id: 42,
  } as any);
});

test('ignores different update', async t => {
  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  const question = new StatelessQuestion('unicorns', () => {
    t.fail();
  });
  bot.use(question.middleware());
  bot.use(() => {
    t.pass();
  });

  await bot.handleUpdate({
    update_id: 42,
    callback_query: {
      id: '42',
      from: {id: 42, is_bot: false, first_name: 'Bob'},
      chat_instance: '42',
      data: '666',
    },
  });
});

test('ignores different message', async t => {
  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  const question = new StatelessQuestion('unicorns', () => {
    t.fail();
  });
  bot.use(question.middleware());
  bot.use(() => {
    t.pass();
  });

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
});

test('ignores message replying to something else', async t => {
  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  const question = new StatelessQuestion('unicorns', () => {
    t.fail();
  });
  bot.use(question.middleware());
  bot.use(() => {
    t.pass();
  });

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: {id: 42, first_name: 'Bob', is_bot: true},
      chat: {id: 42, type: 'private', first_name: 'Bob'},
      date: 42,
      text: 'unrelated',
      reply_to_message: {
        message_id: 43,
        from: {id: 42, first_name: 'Bob', is_bot: true},
        chat: {id: 42, type: 'private', first_name: 'Bob'},
        date: 10,
        text: 'whatever',
      } as any,
    },
  });
});

test('ignores message replying to something else with entities', async t => {
  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  const question = new StatelessQuestion('unicorns', () => {
    t.fail();
  });
  bot.use(question.middleware());
  bot.use(() => {
    t.pass();
  });

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: {id: 42, first_name: 'Bob', is_bot: true},
      chat: {id: 42, type: 'private', first_name: 'Bob'},
      date: 42,
      text: 'unrelated',
      reply_to_message: {
        message_id: 43,
        from: {id: 42, first_name: 'Bob', is_bot: true},
        chat: {id: 42, type: 'private', first_name: 'Bob'},
        date: 10,
        text: 'whatever',
        entities: [{
          type: 'text_link',
          url: 'http://t.me/EdJoPaTo',
          offset: 0,
          length: 2,
        }],
      } as any,
    },
  });
});

test('ignores message replying to another question', async t => {
  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  const question = new StatelessQuestion('unicorns', () => {
    t.fail();
  });
  bot.use(question.middleware());
  bot.use(() => {
    t.pass();
  });

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: {id: 42, first_name: 'Bob', is_bot: true},
      chat: {id: 42, type: 'private', first_name: 'Bob'},
      date: 42,
      text: 'unrelated',
      reply_to_message: {
        message_id: 43,
        from: {id: 42, first_name: 'Bob', is_bot: true},
        chat: {id: 42, type: 'private', first_name: 'Bob'},
        date: 10,
        text: 'whatever',
        entities: [{
          type: 'text_link',
          url: 'http://t.me/#other#',
          offset: 0,
          length: 2,
        }],
      } as any,
    },
  });
});

test('correctly works with text message', async t => {
  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  const question = new StatelessQuestion('unicorns', ctx => {
    t.is(ctx.message.message_id, 42);
    t.is(ctx.message.reply_to_message.message_id, 43);
  });
  bot.use(question.middleware());
  bot.use(() => {
    t.fail();
  });

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: {id: 42, first_name: 'Bob', is_bot: true},
      chat: {id: 42, type: 'private', first_name: 'Bob'},
      date: 42,
      text: 'the answer',
      reply_to_message: {
        message_id: 43,
        from: {id: 42, first_name: 'Bob', is_bot: true},
        chat: {id: 42, type: 'private', first_name: 'Bob'},
        date: 10,
        text: 'whatever',
        entities: [{
          type: 'text_link',
          url: 'http://t.me/#unicorns#',
          offset: 0,
          length: 2,
        }],
      } as any,
    },
  });
});

test('correctly works with text message with additional state', async t => {
  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  const question = new StatelessQuestion('unicorns', (ctx, additionalState) => {
    t.is(ctx.message.message_id, 42);
    t.is(ctx.message.reply_to_message.message_id, 43);
    t.is(additionalState, 'explode');
  });
  bot.use(question.middleware());
  bot.use(() => {
    t.fail();
  });

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: {id: 42, first_name: 'Bob', is_bot: true},
      chat: {id: 42, type: 'private', first_name: 'Bob'},
      date: 42,
      text: 'the answer',
      reply_to_message: {
        message_id: 43,
        from: {id: 42, first_name: 'Bob', is_bot: true},
        chat: {id: 42, type: 'private', first_name: 'Bob'},
        date: 10,
        text: 'whatever',
        entities: [{
          type: 'text_link',
          url: 'http://t.me/#unicorns#explode',
          offset: 0,
          length: 2,
        }],
      } as any,
    },
  });
});

test('additional state url encoding is removed before passed to function', async t => {
  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  const question = new StatelessQuestion('unicorns', (ctx, additionalState) => {
    t.is(ctx.message.message_id, 42);
    t.is(ctx.message.reply_to_message.message_id, 43);
    t.is(additionalState, 'foo bar');
  });
  bot.use(question.middleware());
  bot.use(() => {
    t.fail();
  });

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: {id: 42, first_name: 'Bob', is_bot: true},
      chat: {id: 42, type: 'private', first_name: 'Bob'},
      date: 42,
      text: 'the answer',
      reply_to_message: {
        message_id: 43,
        from: {id: 42, first_name: 'Bob', is_bot: true},
        chat: {id: 42, type: 'private', first_name: 'Bob'},
        date: 10,
        text: 'whatever',
        entities: [{
          type: 'text_link',
          url: 'http://t.me/#unicorns#foo%20bar',
          offset: 0,
          length: 2,
        }],
      } as any,
    },
  });
});

test('correctly works with media message', async t => {
  const bot = new Bot('123:ABC');
  (bot as any).botInfo = {};
  const question = new StatelessQuestion('unicorns', ctx => {
    t.is(ctx.message.message_id, 42);
    t.is(ctx.message.reply_to_message.message_id, 43);
  });
  bot.use(question.middleware());
  bot.use(() => {
    t.fail();
  });

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: {id: 42, first_name: 'Bob', is_bot: true},
      chat: {id: 42, type: 'private', first_name: 'Bob'},
      date: 42,
      text: 'the answer',
      reply_to_message: {
        message_id: 43,
        from: {id: 42, first_name: 'Bob', is_bot: true},
        chat: {id: 42, type: 'private', first_name: 'Bob'},
        date: 10,
        photo: [],
        caption: 'whatever',
        caption_entities: [{
          type: 'text_link',
          url: 'http://t.me/#unicorns#',
          offset: 0,
          length: 2,
        }],
      } as any,
    },
  });
});
