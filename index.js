const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
  throw new Error("توکن بات تنظیم نشده است.");
}

const bot = new TelegramBot(TOKEN, {
  polling: true
});

// اطلاعات کاربران و وضعیت ارسال
const users = new Map();
const pending = new Map();
const replies = new Map();
const messageOwners = new Map();

function mainMenu() {
  return {
    reply_markup: {
      keyboard: [
        [{ text: "🌙 لینکِ شخصیِ من" }, { text: "💌 پیامِ ناشناس" }],
        [{ text: "♡ پاسخ به پیام ♡" }, { text: "✦ راهنمای کوچولو ✦" }]
      ],
      resize_keyboard: true
    }
  };
}

function glassMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "𓆩 💌 لینکِ من 𓆪", callback_data: "link" },
          { text: "𓆩 🌙 راهنما 𓆪", callback_data: "help" }
        ]
      ]
    }
  };
}

async function getLink(id) {
  const me = await bot.getMe();
  return `https://t.me/${me.username}?start=${id}`;
}

bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
  const id = msg.chat.id;
  const code = match?.[1];

  users.set(id, true);

  if (code && /^\d+$/.test(code)) {
    const target = Number(code);

    if (target !== id) {
      pending.set(id, target);

      return bot.sendMessage(
        id,
        "╭─── 𓆩 ♡ 𓆪 ───╮\n" +
        "     پیامِ بی‌نام\n" +
        "╰─── 𓆩 ♡ 𓆪 ───╯\n\n" +
        "حرفی که توی دلت مونده بنویس...\n" +
        "متن، عکس، ویدیو یا ویس بفرست. 🌙\n\n" +
        "𓂃 اسمت برای گیرنده فرستاده نمی‌شه.",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "♡ بی‌خیال شدم", callback_data: "cancel" }]
            ]
          }
        }
      );
    }
  }

  const link = await getLink(id);

  bot.sendMessage(
    id,
    "╭────── 𓆩 🌙 𓆪 ──────╮\n" +
    "           𝘼𝙉𝙊𝙉𝙔\n" +
    "╰────── 𓆩 ♡ 𓆪 ──────╯\n\n" +
    "به گوشه‌ی دنجِ حرف‌های ناگفته خوش اومدی...\n\n" +
    "💌 لینکِ مخصوصِ تو:\n" + link + "\n\n" +
    "لینکت رو برای بقیه بفرست تا بی‌نام برات پیام بذارن.\n\n" +
    "𓂃 بعضی حرف‌ها، اسم نمی‌خوان. ♡",
    {
      ...mainMenu(),
      reply_markup: {
        ...mainMenu().reply_markup,
        ...glassMenu().reply_markup
      }
    }
  );
});

bot.on("callback_query", async (q) => {
  const id = q.message.chat.id;
  await bot.answerCallbackQuery(q.id);

  if (q.data === "link") {
    const link = await getLink(id);
    return bot.sendMessage(
      id,
      "𓆩 ♡ لینکِ شخصیِ تو ♡ 𓆪\n\n" +
      link +
      "\n\nاین لینک رو بفرست تا برات پیام ناشناس بذارن. 🌙",
      mainMenu()
    );
  }

  if (q.data === "help") {
    return bot.sendMessage(
      id,
      "𓆩 راهنمای کوچولو 𓆪\n\n" +
      "🌙 لینک شخصی‌ات رو برای بقیه بفرست.\n" +
      "💌 هرکس از لینک وارد بشه می‌تونه پیام بده.\n" +
      "♡ برای پاسخ، از دکمه‌ی پاسخ زیر پیام استفاده کن.",
      mainMenu()
    );
  }

  if (q.data === "cancel") {
    pending.delete(id);
    replies.delete(id);
    return bot.sendMessage(id, "𓂃 ارسال لغو شد. ♡", mainMenu());
  }

  if (q.data.startsWith("reply:")) {
    const target = Number(q.data.split(":")[1]);
    replies.set(id, target);
    return bot.sendMessage(
      id,
      "𓆩 💌 پاسخِ بی‌نام 𓆪\n\nپیامت رو بفرست...",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "♡ لغو", callback_data: "cancel" }]
          ]
        }
      }
    );
  }
});

bot.on("message", async (msg) => {
  const id = msg.chat.id;
  if (msg.text?.startsWith("/")) return;

  if (msg.text === "🌙 لینکِ شخصیِ من") {
    const link = await getLink(id);
    return bot.sendMessage(id, "𓆩 لینکِ شخصیِ تو 𓆪\n\n" + link, mainMenu());
  }

  if (msg.text === "💌 پیامِ ناشناس") {
    return bot.sendMessage(
      id,
      "برای پیام دادن به کسی، لینک شخصی‌اش رو باز کن. 🌙",
      mainMenu()
    );
  }

  if (msg.text === "♡ پاسخ به پیام ♡") {
    return bot.sendMessage(
      id,
      "برای پاسخ ناشناس، روی دکمه‌ی «پاسخ» زیر پیام دریافتی بزن. ♡",
      mainMenu()
    );
  }

  if (msg.text === "✦ راهنمای کوچولو ✦") {
    return bot.sendMessage(
      id,
      "لینک شخصی‌ات رو بده تا بقیه ناشناس برات پیام بذارن. 🌙",
      mainMenu()
    );
  }

  let target = null;
  let isReply = false;

  if (replies.has(id)) {
    target = replies.get(id);
    isReply = true;
    replies.delete(id);
  } else if (pending.has(id)) {
    target = pending.get(id);
  } else {
    return;
  }

  if (target === id) {
    return bot.sendMessage(id, "نمی‌تونی به خودت پیام بدی. ♡", mainMenu());
  }

  try {
    const sent = await bot.copyMessage(target, id, msg.message_id);

    messageOwners.set(`${target}:${sent.message_id}`, id);

    await bot.sendMessage(
      target,
      isReply ? "𓆩 ♡ پاسخِ ناشناس ♡ 𓆪" : "𓆩 💌 یک پیامِ ناشناس داری 💌 𓆪",
      {
        reply_markup: {
          inline_keyboard: [
            [{
              text: "♡ پاسخِ ناشناس",
              callback_data: `reply:${id}`
            }]
          ]
        }
      }
    );

    await bot.sendMessage(
      id,
      isReply ? "♡ پاسخت فرستاده شد." : "♡ پیامت با موفقیت فرستاده شد.",
      mainMenu()
    );

    if (!isReply) pending.delete(id);

  } catch (err) {
    console.error(err.message);
    await bot.sendMessage(
      id,
      "𓂃 پیام فرستاده نشد. شاید گیرنده هنوز بات رو شروع نکرده یا بات رو مسدود کرده. ♡",
      mainMenu()
    );
  }
});

bot.on("polling_error", (err) => {
  console.error("خطای اتصال:", err.message);
});

console.log("𓆩 𝘼𝙉𝙊𝙉𝙔 روشن شد 🌙 𓆪");