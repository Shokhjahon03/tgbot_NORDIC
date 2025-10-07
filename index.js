// index.js
require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
BOT_TOKEN = "8376231340:AAHW7p6WGbqhO-UXCf1nhPqa8RuqRA0i6mo";
WEBHOOK_URL = "https://tgbot-nordic.onrender.com";
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("BOT_TOKEN not set");
  process.exit(1);
}

const app = express();
app.use(express.json());

const bot = new TelegramBot(token, { webHook: true });

// Use WEBHOOK_URL from env (set in Render)
const WEBHOOK_URL = process.env.WEBHOOK_URL;
if (!WEBHOOK_URL) {
  console.error("WEBHOOK_URL not set");
  process.exit(1);
}

const webhookPath = `/bot${token}`;
const fullWebhookUrl = `${WEBHOOK_URL}${webhookPath}`;

(async () => {
  try {
    await bot.setWebHook(fullWebhookUrl);
    console.log("Webhook set to:", fullWebhookUrl);
  } catch (e) {
    console.error("Failed to set webhook:", e);
  }
})();

// Telegram will POST updates here
app.post(webhookPath, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Example handlers
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

bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  if (query.data === "books") {
    bot.sendMessage(chatId, "📖 Kitoblar bo‘limi hali qo‘shilmagan.");
  }
  bot.answerCallbackQuery(query.id);
});

// Bind to Render port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
