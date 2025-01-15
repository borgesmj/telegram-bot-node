//* importamos dotenv para extraer la variable de entorno
import dotenv from "dotenv";
dotenv.config();
// * importando las funciones de manejadores y respuetas
import commandHandler from "./src/handlers/commandHandler.js";
// * importamos Telegram-bot-api para utilizar la API de Telegram
import TelegramBotAPI from "node-telegram-bot-api";
import { changeName } from "./src/handlers/MessagesHandler.js";
import messageSender from "./src/senders/messageSender.js";
import { botReplies } from "./src/messages/replies.js";
import { createNewUser } from "./src/database/databaseHandlers.js";
import signInUser from "./src/handlers/signInUser.js";

// * Generamos una constante con el token del bot
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

// * Inicializamos el bot
const bot = new TelegramBotAPI(telegramBotToken, { polling: true });

/**
 * * Utilizamos dos eventos de la API de Telegram
 * @function onText que maneja los comandos con un regex
 * @function on que maneja los mensajes que no sean comandos ignorando los mensajes que comiencen con /
 */

const userStates = {};
const STATES = {
  WAITING_FOR_NEW_FIRST_NAME: "waiting_for_new_first_name",
  WAITING_FOR_EMAIL: "waiting_for_email",
  WAITING_FOR_NAME: "waiting_for_name",
  WAITING_FOR_AMOUNT: "waiting_for_amount",
  WAITING_FOR_TYPE: "waiting_for_type",
  COMPLETED: "completed",
};

let newUserProfile = {};
bot.onText(/\/(\w+)/, (msg, match) => {
  const command = match[1];
  commandHandler(command, bot, msg, newUserProfile, userStates, STATES);
});

bot.on("message", (msg) => {
  // ! Si el mensaje es un comando, lo ignoramos aquí
  if (msg.text && msg.text.startsWith("/")) {
    return;
  }

  const chatId = msg.chat.id;

  // ! Procesar mensajes que no sean comandos
  switch (userStates[chatId]?.state) {
    case "waiting_for_new_first_name":
      newUserProfile = changeName(newUserProfile, msg);
      messageSender(
        chatId,
        botReplies[2].replace("%username", newUserProfile.first_name),
        bot
      );
      messageSender(chatId, botReplies[4], bot);
      userStates[chatId].state = STATES.WAITING_FOR_EMAIL;
      return;
    case "waiting_for_email":
      newUserProfile.email = msg.text;
      createNewUser(chatId, newUserProfile)
      signInUser(newUserProfile)
      messageSender(chatId, botReplies[5], bot);
      messageSender(chatId, botReplies[6], bot);
      userStates[chatId].state = STATES.COMPLETED;
      return;
    default:
      break;
  }
  bot.sendMessage(chatId, "Recibí tu mensaje que no es un comando");
});

bot.on("polling_error", (msg) => console.log(msg));
