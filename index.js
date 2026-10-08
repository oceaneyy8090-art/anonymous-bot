const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
  console.error("❌ توکن بات پیدا نشد.");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, {
  polling: true
});

// اطلاعات لینک‌های شخصی
const users = new Map();

// کاربری که در حال فرستادن پیام ناشناس است
const activeSenders = new Map();

// برای پاسخ دادن به پیام ناشناس
const replyTargets = new Map();


// ─────────────────────────────
// منوی اصلی
// ─────────────────────────────

function mainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "💌 لینک شخصی من",
            callback_data: "my_link"
          }
        ],
        [
          {
            text: "🌙 فرستادن پیام ناشناس",
            callback_data: "send_message"
          }
        ],
        [
          {
            text: "✨ راهنما",
            callback_data: "help"
          }
        ]
      ]
    }
  };
}


// ─────────────────────────────
// ساخت لینک شخصی
// ─────────────────────────────

async function getPersonalLink(chatId) {
  const me = await bot.getMe();

  return `https://t.me/${me.username}?start=${chatId}`;
}


// ─────────────────────────────
// شروع بات
// ─────────────────────────────

bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const code = match && match[1];

  // ثبت کاربر
  users.set(String(chatId), {
    id: chatId,
    name: msg.from.first_name || "دوست ناشناس"
  });

  // اگر از لینک شخصی کسی وارد شده
  if (code) {

    const targetId = Number(code);

    if (
      !isNaN(targetId) &&
      targetId !== chatId &&
      users.has(String(targetId))
    ) {

      activeSenders.set(chatId, targetId);

      await bot.sendMessage(
        chatId,
        `╭───────────────╮
   𓆩 🌙 𓆪  پیام ناشناس
╰───────────────╯

اینجا می‌تونی هر حرفی که
توی دلت مونده رو بی‌نام بفرستی.

♡ نامت نمایش داده نمی‌شه
♡ شناسه‌ات نمایش داده نمی‌شه
♡ صاحب لینک نمی‌فهمه تو کی هستی

✦ پیامت رو همین‌جا بفرست...`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🌙 لغو",
                  callback_data: "cancel_send"
                }
              ]
            ]
          }
        }
      );

      return;
    }
  }

  // لینک شخصی
  const personalLink = await getPersonalLink(chatId);

  await bot.sendMessage(
    chatId,
    `╭───────────────╮
   𓆩 🌙 𓆪  شبِ ناشناس
╰───────────────╯

سلام ${msg.from.first_name || "قشنگم"} ✨

اینجا جاییه برای حرف‌هایی
که می‌خوای بدون اسم گفته بشن.

💌 لینک شخصی تو:

${personalLink}

لینکت رو برای بقیه بفرست
تا برات پیام ناشناس بفرستن.

╭───────────────╮
   ♡ بی‌نام • بی‌رد ♡
╰───────────────╯`,
    mainMenu()
  );
});


// ─────────────────────────────
// دکمه‌های شیشه‌ای
// ─────────────────────────────

bot.on("callback_query", async (query) => {

  const chatId = query.message.chat.id;

  await bot.answerCallbackQuery(query.id);

  // لینک شخصی
  if (query.data === "my_link") {

    const link = await getPersonalLink(chatId);

    await bot.sendMessage(
      chatId,
      `╭───────────────╮
   𓆩 💌 𓆪  لینک شخصی تو
╰───────────────╯

این لینک مخصوص خودته:

${link}

✦ لینکت رو کپی کن
✦ برای دوستات بفرست
✦ پیام‌ها رو ناشناس دریافت کن

🌙 هرکس وارد این لینک بشه
می‌تونه برات پیام ناشناس بفرسته.`,
      mainMenu()
    );
  }


  // فرستادن پیام
  if (query.data === "send_message") {

    await bot.sendMessage(
      chatId,
      `╭───────────────╮
   𓆩 💌 𓆪  فرستادن پیام
╰───────────────╯

برای فرستادن پیام ناشناس
باید لینک شخصی اون شخص رو داشته باشی.

روی لینک بزن و وارد بات شو.

🌙 بعدش پیامت رو بفرست.`,
      mainMenu()
    );
  }


  // راهنما
  if (query.data === "help") {

    await bot.sendMessage(
      chatId,
      `╭───────────────╮
   𓆩 ✨ 𓆪  راهنمای بات
╰───────────────╯

💌 لینک شخصی من
لینک مخصوص خودت رو نشون می‌ده.

🌙 هرکس وارد لینک تو بشه
می‌تونه ناشناس برات پیام بفرسته.

📩 پیام می‌تونه شامل:
متن
عکس
ویدیو
ویس
فایل
استیکر
باشه.

♡ هویت فرستنده برای گیرنده
نمایش داده نمی‌شه.

╰───────────────╯`,
      mainMenu()
    );
  }


  // لغو ارسال
  if (query.data === "cancel_send") {

    activeSenders.delete(chatId);

    await bot.sendMessage(
      chatId,
      `🌙 ارسال پیام لغو شد.

هر وقت خواستی دوباره امتحان کن ✨`,
      mainMenu()
    );
  }


  // پاسخ دادن
  if (query.data.startsWith("reply_")) {

    const targetId = Number(
      query.data.replace("reply_", "")
    );

    if (!targetId) return;

    replyTargets.set(chatId, targetId);

    await bot.sendMessage(
      chatId,
      `╭───────────────╮
   𓆩 💌 𓆪  پاسخ ناشناس
╰───────────────╯

پیامت رو بنویس و بفرست.

🌙 پاسخ تو بدون نمایش هویت
برای فرستنده پیام ارسال می‌شه.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🌙 لغو",
                callback_data: "cancel_reply"
              }
            ]
          ]
        }
      }
    );
  }


  // لغو پاسخ
  if (query.data === "cancel_reply") {

    replyTargets.delete(chatId);

    await bot.sendMessage(
      chatId,
      `🌙 پاسخ لغو شد.`,
      mainMenu()
    );
  }
});


// ─────────────────────────────
// دریافت پیام‌ها
// ─────────────────────────────

bot.on("message", async (msg) => {

  const chatId = msg.chat.id;

  // دستورات
  if (msg.text && msg.text.startsWith("/")) {
    return;
  }


  // ─────────────────────────
  // پاسخ ناشناس
  // ─────────────────────────

  if (replyTargets.has(chatId)) {

    const targetId = replyTargets.get(chatId);

    try {

      await bot.sendMessage(
        targetId,
        `╭───────────────╮
   𓆩 💌 𓆪  پاسخ ناشناس
╰───────────────╯

یک پاسخ ناشناس برای پیامت دریافت کردی 🌙`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "💌 پاسخ دادن",
                  callback_data: `reply_${chatId}`
                }
              ]
            ]
          }
        }
      );

      // ارسال محتوای واقعی
      await forwardAnonymous(targetId, msg);

      await bot.sendMessage(
        chatId,
        `✨ پاسخت با موفقیت ناشناس فرستاده شد.`,
        mainMenu()
      );

    } catch (error) {

      await bot.sendMessage(
        chatId,
        `❌ ارسال پاسخ انجام نشد.

ممکنه طرف مقابل بات رو مسدود کرده باشه.`
      );
    }

    replyTargets.delete(chatId);

    return;
  }


  // ─────────────────────────
  // پیام ناشناس جدید
  // ─────────────────────────

  if (activeSenders.has(chatId)) {

    const targetId = activeSenders.get(chatId);

    try {

      // فرستادن پیام اصلی
      await forwardAnonymous(targetId, msg);

      // دکمه پاسخ
      await bot.sendMessage(
        targetId,
        `╭───────────────╮
   𓆩 🌙 𓆪  پیام ناشناس
╰───────────────╯

یک پیام ناشناس جدید داری 💌

🌙 فرستنده برای تو ناشناسه.`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "💌 پاسخ دادن",
                  callback_data: `reply_${chatId}`
                }
              ]
            ]
          }
        }
      );

      await bot.sendMessage(
        chatId,
        `╭───────────────╮
   𓆩 ✨ 𓆪  فرستاده شد
╰───────────────╯

پیامت با موفقیت ارسال شد.

🌙 هویتت همچنان ناشناس می‌مونه.

اگر دوست داری پیام دیگه‌ای بفرستی،
دوباره بنویس.`,
        mainMenu()
      );

    } catch (error) {

      console.error(error);

      await bot.sendMessage(
        chatId,
        `❌ پیام ارسال نشد.

ممکنه صاحب لینک بات رو مسدود کرده باشه.`
      );
    }

    return;
  }
});


// ─────────────────────────────
// ارسال ناشناس انواع محتوا
// ─────────────────────────────

async function forwardAnonymous(targetId, msg) {

  // متن
  if (msg.text) {

    await bot.sendMessage(
      targetId,
      `「 ${msg.text} 」\n\n🌙 ــ پیام ناشناس`
    );

    return;
  }


  // عکس
  if (msg.photo) {

    const photo = msg.photo[msg.photo.length - 1].file_id;

    await bot.sendPhoto(
      targetId,
      photo,
      {
        caption: `🌙 ــ تصویر ناشناس`
      }
    );

    return;
  }


  // ویدیو
  if (msg.video) {

    await bot.sendVideo(
      targetId,
      msg.video.file_id,
      {
        caption: `🌙 ــ ویدیوی ناشناس`
      }
    );

    return;
  }


  // ویس
  if (msg.voice) {

    await bot.sendVoice(
      targetId,
      msg.voice.file_id,
      {
        caption: `🌙 ــ پیام صوتی ناشناس`
      }
    );

    return;
  }


  // فایل
  if (msg.document) {

    await bot.sendDocument(
      targetId,
      msg.document.file_id,
      {
        caption: `🌙 ــ فایل ناشناس`
      }
    );

    return;
  }


  // استیکر
  if (msg.sticker) {

    await bot.sendSticker(
      targetId,
      msg.sticker.file_id
    );

    await bot.sendMessage(
      targetId,
      `🌙 ــ استیکر ناشناس`
    );

    return;
  }


  // GIF
  if (msg.animation) {

    await bot.sendAnimation(
      targetId,
      msg.animation.file_id,
      {
        caption: `🌙 ــ پیام ناشناس`
      }
    );

    return;
  }


  // اگر نوع پیام پشتیبانی نشد
  await bot.sendMessage(
    targetId,
    `🌙 یک پیام ناشناس دریافت کردی.`
  );
}


// ─────────────────────────────
// خطاها
// ─────────────────────────────

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

process.on("uncaughtException", (error) => {
  console.error("خطای برنامه:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("خطای برنامه:", error);
});


console.log("🌙 بات ناشناس روشن شد...");