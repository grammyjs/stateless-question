import { Bot } from "https://deno.land/x/grammy@v1.15.3/mod.ts";
import {
  suffixHTML,
  suffixMarkdown,
  suffixMarkdownV2,
} from "../source/identifier.ts";
import { StatelessQuestion } from "../source/mod.ts";
import {
  assertEquals,
  fail,
} from "https://deno.land/std@0.182.0/testing/asserts.ts";

const BOT_INFO = {
  id: 123,
  is_bot: true as const,
  username: "testbot",
  first_name: "Test",
  can_join_groups: false,
  supports_inline_queries: false,
  can_read_all_group_messages: false,
};

Deno.test("uniqueIdentifier keeps the same", () => {
  const question = new StatelessQuestion("unicorns", () => {});
  assertEquals(question.uniqueIdentifier, "unicorns");
});

Deno.test("messageSuffixMarkdown", () => {
  assertEquals(
    suffixMarkdown("unicorns", undefined),
    "[\u200C](http://t.me/#unicorns#)",
  );
});

Deno.test("messageSuffixMarkdown with additional state", () => {
  assertEquals(
    suffixMarkdown("unicorns", "explode"),
    "[\u200C](http://t.me/#unicorns#explode)",
  );
});

Deno.test("messageSuffixMarkdown additional state gets url encoded correctly", () => {
  assertEquals(
    suffixMarkdown("unicorns", "foo bar"),
    "[\u200C](http://t.me/#unicorns#foo%20bar)",
  );
});

Deno.test("messageSuffixMarkdownV2", () => {
  assertEquals(
    suffixMarkdownV2("unicorns", undefined),
    "[\u200C](http://t.me/#unicorns#)",
  );
});

Deno.test("messageSuffixMarkdownV2 with additional state", () => {
  assertEquals(
    suffixMarkdownV2("unicorns", "explode"),
    "[\u200C](http://t.me/#unicorns#explode)",
  );
});

Deno.test("messageSuffixMarkdownV2 additional state gets url encoded correctly", () => {
  assertEquals(
    suffixMarkdownV2("unicorns", "foo bar"),
    "[\u200C](http://t.me/#unicorns#foo%20bar)",
  );
});

Deno.test("messageSuffixHTML", () => {
  assertEquals(
    suffixHTML("unicorns", undefined),
    '<a href="http://t.me/#unicorns#">\u200C</a>',
  );
});

Deno.test("messageSuffixHTML with additional state", () => {
  assertEquals(
    suffixHTML("unicorns", "explode"),
    '<a href="http://t.me/#unicorns#explode">\u200C</a>',
  );
});

Deno.test("messageSuffixHTML additional state gets url encoded correctly", () => {
  assertEquals(
    suffixHTML("unicorns", "foo bar"),
    '<a href="http://t.me/#unicorns#foo%20bar">\u200C</a>',
  );
});

Deno.test("can replyWithMarkdown the question correctly", async () => {
  const question = new StatelessQuestion("unicorns", () => {
    fail();
  });

  const bot = new Bot("123:ABC");
  bot.botInfo = BOT_INFO;
  bot.use((ctx, next) => {
    ctx.reply = (text, extra) => {
      assertEquals(text, "banana" + question.messageSuffixMarkdown());
      assertEquals(extra, {
        parse_mode: "Markdown",
        reply_markup: { force_reply: true },
      });

      return Promise.resolve({
        message_id: 42,
        date: 42,
        from: { id: 42, is_bot: false, first_name: "Bob" },
        chat: { id: 42, type: "private", first_name: "Bob" },
        text: "666",
      });
    };

    return next();
  });

  bot.use((ctx) => question.replyWithMarkdown(ctx, "banana"));
  await bot.handleUpdate({ update_id: 42 });
});

Deno.test("can replyWithMarkdownV2 the question correctly", async () => {
  const question = new StatelessQuestion("unicorns", () => {
    fail();
  });

  const bot = new Bot("123:ABC");
  bot.botInfo = BOT_INFO;
  bot.use((ctx, next) => {
    ctx.reply = (text, extra) => {
      assertEquals(text, "banana" + question.messageSuffixMarkdown());
      assertEquals(extra, {
        parse_mode: "MarkdownV2",
        reply_markup: { force_reply: true },
      });

      return Promise.resolve({
        message_id: 42,
        date: 42,
        from: { id: 42, is_bot: false, first_name: "Bob" },
        chat: { id: 42, type: "private", first_name: "Bob" },
        text: "666",
      });
    };

    return next();
  });

  bot.use((ctx) => question.replyWithMarkdownV2(ctx, "banana"));

  await bot.handleUpdate({ update_id: 42 });
});

Deno.test("can replyWithHTML the question correctly", async () => {
  const question = new StatelessQuestion("unicorns", () => {
    fail();
  });

  const bot = new Bot("123:ABC");
  bot.botInfo = BOT_INFO;
  bot.use((ctx, next) => {
    ctx.reply = (text, extra) => {
      assertEquals(text, "banana" + question.messageSuffixHTML());
      assertEquals(extra, {
        parse_mode: "HTML",
        reply_markup: { force_reply: true },
      });

      return Promise.resolve({
        message_id: 42,
        date: 42,
        from: { id: 42, is_bot: false, first_name: "Bob" },
        chat: { id: 42, type: "private", first_name: "Bob" },
        text: "666",
      });
    };

    return next();
  });

  bot.use((ctx) => question.replyWithHTML(ctx, "banana"));
  await bot.handleUpdate({ update_id: 42 });
});

Deno.test("ignores different update", async () => {
  const bot = new Bot("123:ABC");
  bot.botInfo = BOT_INFO;
  const question = new StatelessQuestion("unicorns", () => {
    fail();
  });
  bot.use(question.middleware());
  bot.use(() => {});

  await bot.handleUpdate({
    update_id: 42,
    callback_query: {
      id: "42",
      from: { id: 42, is_bot: false, first_name: "Bob" },
      chat_instance: "42",
      data: "666",
    },
  });
});

Deno.test("ignores different message", async () => {
  const bot = new Bot("123:ABC");
  bot.botInfo = BOT_INFO;
  const question = new StatelessQuestion("unicorns", () => {
    fail();
  });
  bot.use(question.middleware());
  bot.use(() => {});

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: { id: 42, first_name: "Bob", is_bot: true },
      chat: { id: 42, type: "private", first_name: "Bob" },
      date: 42,
      text: "unrelated",
    },
  });
});

Deno.test("ignores message replying to something else", async () => {
  const bot = new Bot("123:ABC");
  bot.botInfo = BOT_INFO;
  const question = new StatelessQuestion("unicorns", () => {
    fail();
  });
  bot.use(question.middleware());
  bot.use(() => {});

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: { id: 42, first_name: "Bob", is_bot: true },
      chat: { id: 42, type: "private", first_name: "Bob" },
      date: 42,
      text: "unrelated",
      // @ts-expect-error missing some keys
      reply_to_message: {
        message_id: 43,
        from: { id: 42, first_name: "Bob", is_bot: true },
        chat: { id: 42, type: "private", first_name: "Bob" },
        date: 10,
        text: "whatever",
      },
    },
  });
});

Deno.test(
  "ignores message replying to something else with entities",
  async () => {
    const bot = new Bot("123:ABC");
    bot.botInfo = BOT_INFO;
    const question = new StatelessQuestion("unicorns", () => {
      fail();
    });
    bot.use(question.middleware());
    bot.use(() => {});

    await bot.handleUpdate({
      update_id: 42,
      message: {
        message_id: 42,
        from: { id: 42, first_name: "Bob", is_bot: true },
        chat: { id: 42, type: "private", first_name: "Bob" },
        date: 42,
        text: "unrelated",
        // @ts-expect-error missing some keys
        reply_to_message: {
          message_id: 43,
          from: { id: 42, first_name: "Bob", is_bot: true },
          chat: { id: 42, type: "private", first_name: "Bob" },
          date: 10,
          text: "whatever",
          entities: [{
            type: "text_link",
            url: "http://t.me/EdJoPaTo",
            offset: 0,
            length: 2,
          }],
        },
      },
    });
  },
);

Deno.test("ignores message replying to another question", async () => {
  const bot = new Bot("123:ABC");
  bot.botInfo = BOT_INFO;
  const question = new StatelessQuestion("unicorns", () => {
    fail();
  });
  bot.use(question.middleware());
  bot.use(() => {});

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: { id: 42, first_name: "Bob", is_bot: true },
      chat: { id: 42, type: "private", first_name: "Bob" },
      date: 42,
      text: "unrelated",
      // @ts-expect-error missing some keys
      reply_to_message: {
        message_id: 43,
        from: { id: 42, first_name: "Bob", is_bot: true },
        chat: { id: 42, type: "private", first_name: "Bob" },
        date: 10,
        text: "whatever",
        entities: [{
          type: "text_link",
          url: "http://t.me/#other#",
          offset: 0,
          length: 2,
        }],
      },
    },
  });
});

Deno.test("correctly works with text message", async () => {
  const bot = new Bot("123:ABC");
  bot.botInfo = BOT_INFO;
  const question = new StatelessQuestion("unicorns", (ctx) => {
    assertEquals(ctx.message.message_id, 42);
    assertEquals(ctx.message.reply_to_message.message_id, 43);
  });
  bot.use(question.middleware());
  bot.use(() => {
    fail();
  });

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: { id: 42, first_name: "Bob", is_bot: true },
      chat: { id: 42, type: "private", first_name: "Bob" },
      date: 42,
      text: "the answer",
      // @ts-expect-error missing some keys
      reply_to_message: {
        message_id: 43,
        from: { id: 42, first_name: "Bob", is_bot: true },
        chat: { id: 42, type: "private", first_name: "Bob" },
        date: 10,
        text: "whatever",
        entities: [{
          type: "text_link",
          url: "http://t.me/#unicorns#",
          offset: 0,
          length: 2,
        }],
      },
    },
  });
});

Deno.test(
  "correctly works with text message with additional state",
  async () => {
    const bot = new Bot("123:ABC");
    bot.botInfo = BOT_INFO;
    const question = new StatelessQuestion(
      "unicorns",
      (ctx, additionalState) => {
        assertEquals(ctx.message.message_id, 42);
        assertEquals(ctx.message.reply_to_message.message_id, 43);
        assertEquals(additionalState, "explode");
      },
    );
    bot.use(question.middleware());
    bot.use(() => {
      fail();
    });

    await bot.handleUpdate({
      update_id: 42,
      message: {
        message_id: 42,
        from: { id: 42, first_name: "Bob", is_bot: true },
        chat: { id: 42, type: "private", first_name: "Bob" },
        date: 42,
        text: "the answer",
        // @ts-expect-error missing some keys
        reply_to_message: {
          message_id: 43,
          from: { id: 42, first_name: "Bob", is_bot: true },
          chat: { id: 42, type: "private", first_name: "Bob" },
          date: 10,
          text: "whatever",
          entities: [{
            type: "text_link",
            url: "http://t.me/#unicorns#explode",
            offset: 0,
            length: 2,
          }],
        },
      },
    });
  },
);

Deno.test(
  "additional state url encoding is removed before passed to function",
  async () => {
    const bot = new Bot("123:ABC");
    bot.botInfo = BOT_INFO;
    const question = new StatelessQuestion(
      "unicorns",
      (ctx, additionalState) => {
        assertEquals(ctx.message.message_id, 42);
        assertEquals(ctx.message.reply_to_message.message_id, 43);
        assertEquals(additionalState, "foo bar");
      },
    );
    bot.use(question.middleware());
    bot.use(() => {
      fail();
    });

    await bot.handleUpdate({
      update_id: 42,
      message: {
        message_id: 42,
        from: { id: 42, first_name: "Bob", is_bot: true },
        chat: { id: 42, type: "private", first_name: "Bob" },
        date: 42,
        text: "the answer",
        // @ts-expect-error missing some keys
        reply_to_message: {
          message_id: 43,
          from: { id: 42, first_name: "Bob", is_bot: true },
          chat: { id: 42, type: "private", first_name: "Bob" },
          date: 10,
          text: "whatever",
          entities: [{
            type: "text_link",
            url: "http://t.me/#unicorns#foo%20bar",
            offset: 0,
            length: 2,
          }],
        },
      },
    });
  },
);

Deno.test("correctly works with media message", async () => {
  const bot = new Bot("123:ABC");
  bot.botInfo = BOT_INFO;
  const question = new StatelessQuestion("unicorns", (ctx) => {
    assertEquals(ctx.message.message_id, 42);
    assertEquals(ctx.message.reply_to_message.message_id, 43);
  });
  bot.use(question.middleware());
  bot.use(() => {
    fail();
  });

  await bot.handleUpdate({
    update_id: 42,
    message: {
      message_id: 42,
      from: { id: 42, first_name: "Bob", is_bot: true },
      chat: { id: 42, type: "private", first_name: "Bob" },
      date: 42,
      text: "the answer",
      // @ts-expect-error missing some keys
      reply_to_message: {
        message_id: 43,
        from: { id: 42, first_name: "Bob", is_bot: true },
        chat: { id: 42, type: "private", first_name: "Bob" },
        date: 10,
        photo: [],
        caption: "whatever",
        caption_entities: [{
          type: "text_link",
          url: "http://t.me/#unicorns#",
          offset: 0,
          length: 2,
        }],
      },
    },
  });
});
