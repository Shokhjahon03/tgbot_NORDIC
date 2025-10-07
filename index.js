const TelegramBot = require("node-telegram-bot-api");
const token = "8376231340:AAHW7p6WGbqhO-UXCf1nhPqa8RuqRA0i6mo";
const bot = new TelegramBot(token, { polling: true });

// Start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Boshqaruv paneli:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📖 Kitoblar", callback_data: "books" }],
        [{ text: "📞 Aloqa", url: "https://t.me/arm_Nordic" }],
      ],
    },
  });
});

// Callbacklarni boshqarish
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;

  if (query.data === "books") {
    bot.sendMessage(chatId, "📖 Kitoblar bo‘limi hali qo‘shilmagan.");
  }

  bot.answerCallbackQuery(query.id);
});
