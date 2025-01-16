//* importamos dotenv para extraer la variable de entorno
import dotenv from "dotenv";
dotenv.config();
// * importando las funciones de manejadores y respuetas
import commandHandler from "./src/handlers/commandHandler.js";
// * importamos Telegram-bot-api para utilizar la API de Telegram
import TelegramBotAPI from "node-telegram-bot-api";
import { changeName, handleUserMessages } from "./src/handlers/MessagesHandler.js";
import messageSender from "./src/senders/messageSender.js";
//import { botReplies } from "./src/messages/replies.js";
import { createNewUser } from "./src/database/databaseHandlers.js";
//import signInUser from "./src/handlers/signInUser.js";

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
  WAITING_FOR_USER_CURRENCY: "waiting_for_user_currency",
  WAITING_FOR_NAME: "waiting_for_name",
  WAITING_FOR_AMOUNT: "waiting_for_amount",
  WAITING_FOR_TYPE: "waiting_for_type",
  COMPLETED: "completed",
};

let newUserProfile = {};
let currentUser = {}
bot.onText(/\/(\w+)/, (msg, match) => {
  const command = match[1];
  commandHandler(command, bot, msg, newUserProfile, userStates, STATES, currentUser);
});

bot.on("message", (msg) => {
  // ! Si el mensaje es un comando, lo ignoramos aquí
  if (msg.text && msg.text.startsWith("/")) {
    return;
  }
  handleUserMessages(bot, msg, newUserProfile, userStates, STATES, currentUser)
});

bot.on("polling_error", (msg) => console.log(msg));
