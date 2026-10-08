const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.BOT_TOKEN;

const bot = new TelegramBot(TOKEN, {
  polling: true
});

const waiting = new Map();

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `╭───────────────╮
   𓆩 🌙 𓆪  ANONYMOUS
╰───────────────╯

✦ اینجا می‌تونی کاملاً ناشناس حرف بزنی.
✦ پیامت رو بفرست تا به صورت ناشناس ارسالش کنم.

⋆｡°✩ 𝑵𝒐 𝒏𝒂𝒎𝒆
⋆｡°✩ 𝑵𝒐 𝒕𝒓𝒂𝒄𝒆
⋆｡°✩ 𝑱𝒖𝒔𝒕 𝒚𝒐𝒖

💌 یک پیام بفرست...`
  );
});

bot.on("message", async (msg) => {
  if (msg.text?.startsWith("/")) return;

  const chatId = msg.chat.id;

  if (!waiting.has(chatId)) {
    waiting.set(chatId, true);

    await bot.sendMessage(
      chatId,
      `✦ پیام ناشناس دریافت شد ✦

🌙 پیام تو ثبت شد.
برای ارسال دوباره، یک پیام دیگه بفرست.

──────────────
♡ 𝒂𝒏𝒐𝒏𝒚𝒎𝒐𝒖𝒔 ♡`
    );

    setTimeout(() => {
      waiting.delete(chatId);
    }, 3000);

    return;
  }

  await bot.sendMessage(
    chatId,
    `𓆩♡𓆪 پیام ناشناس تو آماده‌ست

「 ${msg.text || "📎 فایل"} 」

🌙 هویت فرستنده نمایش داده نمی‌شود.`
  );

  waiting.delete(chatId);
});

console.log("🌙 Anonymous bot is running...");