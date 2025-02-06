import express from "express";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import indexRoutes from "./src/routes/index.js";
import dotenv from "dotenv";
import TelegramBotAPI from "node-telegram-bot-api";
import commandHandler from "./src/handlers/commandHandler.js";
import handleUserMessages from "./src/handlers/MessagesHandler.js";
import handleUserQueries from "./src/handlers/queryHandler.js";
import Users from "./src/users/UserManager.class.js";
import MessageSender from "./src/senders/MessageSender.class.js";
// Express
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.set("views", join(__dirname, "src/views"));
app.set("view engine", "ejs");
app.use(express.static(join(__dirname, "src/public")));
app.use(indexRoutes);
const port = parseInt(process.env.PORT) || process.argv[3] || 3000;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
const imagePath = path.join(__dirname, "src", "public", "Images", "QRcodes");
// telegram bot
dotenv.config();
const userManager = new Users();
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBotAPI(telegramBotToken, {
  polling: {
    interval: 3000,
    autoStart: true,
  },
});
const messageSender = new MessageSender(bot);
const baseUrl = "https://telegram-bot-node-cee9.onrender.com";
let currentUser = {};
// Filtrado de mensajes normales
bot.on("photo", async (msg) => {
  const photo = msg.photo;
  const fileId = photo[photo.length - 1].file_id;
  const senderId = msg.from.id;
  const adminId = process.env.ADMIN_ID;

  try {
    await bot.sendPhoto(adminId, fileId);
    messageSender.sendTextMessage(senderId, "Imagen recibida con exito", []);
    messageSender.sendTextMessage(
      adminId,
      `Imagen recibida de: ${senderId}`,
      []
    );
    messageSender.sendMenu(senderId);
  } catch (error) {
    messageSender.sendTextMessage(
      senderId,
      "Error enviando la imagen. Por favor enviala por correo electronico a borgesmj19@gmail.com",
      []
    );
    console.error("Error al reenviar la imagen:", error.message);
    console.error("Detalles del error:", error);
  }
});

bot.on("message", async (msg) => {
  if (msg.text && msg.text.startsWith("/")) {
    return;
  }
  await handleUserMessages(msg, userManager, currentUser, messageSender);
});
// filtrado de comandos
bot.onText(/\/(\w+)/, async (msg, match) => {
  const command = match[1];
  await commandHandler(
    command,
    userManager,
    msg,
    currentUser,
    messageSender,
    baseUrl
  );
});
// filtrado de querys
bot.on("callback_query", async (query) => {
  await handleUserQueries(
    query,
    userManager,
    currentUser,
    messageSender,
    imagePath
  );
});
// errores
bot.on("polling_error", (err) => {
  console.error("Polling error:", err.code, err.message);
  if (err.code === "EFATAL") {
    console.log("Intentando reiniciar el bot...");
    setTimeout(() => bot.startPolling(), 5000);
  }
});

app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).send("Something went wrong!");
});
