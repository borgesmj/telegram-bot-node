import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import indexRoutes from "./src/routes/index.js";
import dotenv from "dotenv";
import TelegramBotAPI from "node-telegram-bot-api";
import commandHandler from "./src/handlers/commandHandler.js";
import handleUserMessages from "./src/handlers/MessagesHandler.js";
import handleUserQueries from "./src/handlers/queryHandler.js";
import Users from "./src/users/userManager.js";
import MessageSender from "./src/senders/botMessagesSender.js";
// Express
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.set("views", join(__dirname, "src/views"));
app.set("view engine", "ejs");
app.use(express.static(join(__dirname, "public")));
app.use(indexRoutes);
const port = parseInt(process.env.PORT) || process.argv[3] || 3000;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

// telegram bot
dotenv.config();
const userManager = new Users();
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBotAPI(telegramBotToken, { polling: true });
const messageSender = new MessageSender(bot)
// Filtrado de mensajes normales
let currentUser = {}
bot.on("message", async (msg) => {
  if (msg.text && msg.text.startsWith("/")) {
    return;
  }
  await handleUserMessages(msg, userManager, currentUser, messageSender);
});
// filtrado de comandos
bot.onText(/\/(\w+)/, async (msg, match) => {
  const command = match[1];
  await commandHandler(command, userManager, msg, currentUser, messageSender);
});
// filtrado de querys
bot.on("callback_query", async (query) => {
  console.log(query)
  await handleUserQueries(query, userManager, currentUser, messageSender);
});
// errores
bot.on("polling_error", (err) => {
  console.log(err);
});
