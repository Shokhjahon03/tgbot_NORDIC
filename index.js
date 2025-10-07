const express = require("express");
const mongoose = require("mongoose");
const TelegramBot = require("node-telegram-bot-api");

// --- Sozlamalar (env o‘rniga) ---
const BOT_TOKEN = "8376231340:AAHW7p6WGbqhO-UXCf1nhPqa8RuqRA0i6mo";
const WEBHOOK_URL = "https://tgbot-nordic.onrender.com";
const MONGODB_URI = "mongodb+srv://quvvatovshohjahon707_db_user:<db_password>@nordic.1mewcal.mongodb.net/?retryWrites=true&w=majority&appName=NORDIC";
const ADMIN_ID = "5757087948"; // O‘zingning Telegram ID’ing

// --- MongoDB ulanish ---
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB ulandi"))
  .catch((err) => console.error("❌ MongoDB xato:", err));

// --- Model ---
const bookSchema = new mongoose.Schema({
  title: String,
  createdAt: { type: Date, default: Date.now },
});
const Book = mongoose.model("Book", bookSchema);

// --- Express ---
const app = express();
app.use(express.json());

// --- Telegram bot ---
const bot = new TelegramBot(BOT_TOKEN, { webHook: true });
const webhookPath = `/bot${BOT_TOKEN}`;
const fullWebhookUrl = `${WEBHOOK_URL}${webhookPath}`;

(async () => {
  await bot.setWebHook(fullWebhookUrl);
  console.log("✅ Webhook o‘rnatildi:", fullWebhookUrl);
})();

app.post(webhookPath, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// --- Holat ---
const userStates = {}; // { userId: "addingBook" }

// --- Start komandasi ---
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "👋 Salom! Bu bot orqali kitoblarni boshqarish mumkin:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📚 Kitoblar ro‘yxati", callback_data: "list_books" }],
        [{ text: "📞 Aloqa", url: "https://t.me/arm_Nordic" }],
      ],
    },
  });
});

// --- Faqat matnli xabarlar ---
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // faqat matn uchun
  if (!text || msg.via_bot) return;

  if (text === "admin") {
    if (chatId.toString() === ADMIN_ID) {
      bot.sendMessage(chatId, "👮‍♂️ Admin panel:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "➕ Kitob qo‘shish", callback_data: "add_book" }],
            [{ text: "📚 Kitoblar ro‘yxati", callback_data: "list_books" }],
          ],
        },
      });
    } else {
      bot.sendMessage(chatId, "⛔ Siz admin emassiz.");
    }
    return;
  }

  // Kitob qo‘shish holati
  if (userStates[chatId] === "addingBook") {
    const newBook = new Book({ title: text });
    await newBook.save();

    delete userStates[chatId];
    bot.sendMessage(chatId, `✅ "${text}" kitobi qo‘shildi!`);
  }
});

// --- Tugma bosilganda ---
bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat.id;
  const data = query.data;

  if (!chatId) return;

  if (data === "add_book") {
    userStates[chatId] = "addingBook";
    await bot.sendMessage(chatId, "📘 Kitob nomini yuboring:");
  }

  if (data === "list_books") {
    const books = await Book.find().sort({ createdAt: -1 });
    if (books.length === 0) {
      await bot.sendMessage(chatId, "📭 Hali kitoblar mavjud emas.");
    } else {
      const list = books.map((b, i) => `${i + 1}. ${b.title}`).join("\n");
      await bot.sendMessage(chatId, "📚 Kitoblar ro‘yxati:\n\n" + list);
    }
  }

  bot.answerCallbackQuery(query.id);
});

// --- Render port ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server ishga tushdi: ${PORT}-port`);
});
