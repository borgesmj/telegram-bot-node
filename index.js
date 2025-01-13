//* importamos dotenv para extraer la variable de entorno
import dotenv from "dotenv"
dotenv.config()
// * importando las funciones de manejadores y respuetas
import commandHandler from "./src/handlers/commandHandler.js";
// * importamos Telegram-bot-api para utilizar la API de Telegram
import TelegramBotAPI from "node-telegram-bot-api";

// * Generamos una constante con el token del bot
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

// * Inicializamos el bot
const bot = new TelegramBotAPI(telegramBotToken, { polling: true });

/**
 * * Utilizamos dos eventos de la API de Telegram
 * @function onText que maneja los comandos con un regex
 * @function on que maneja los mensajes que no sean comandos ignorando los mensajes que comiencen con /
 */

bot.onText(/\/(\w+)/, (msg, match) => {
  const command = match[1];
  commandHandler(command, bot, msg)
});

bot.on("message", (msg) => {
  // ! Si el mensaje es un comando, lo ignoramos aquí
  if (msg.text && msg.text.startsWith("/")) {
    return;
  }

  const chatId = msg.chat.id;

  // ! Procesar mensajes que no sean comandos
  bot.sendMessage(chatId, "Recibí tu mensaje que no es un comando");
});

bot.on("polling_error", (msg) => console.log(msg));
