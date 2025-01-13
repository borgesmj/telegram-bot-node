//* importamos dotenv para extraer la variable de entorno
require("dotenv").config();

// * Create a bot that uses 'polling' to fetch new updates
const TelegramBotAPI = require("node-telegram-bot-api");

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
  bot.sendMessage(msg.chat.id, `Es un comando: ${command}`);
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
