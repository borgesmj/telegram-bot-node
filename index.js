//* importamos dotenv para extraer la variable de entorno
import dotenv from "dotenv";
dotenv.config();
// * importando las funciones de manejadores y respuetas
import commandHandler from "./src/handlers/commandHandler.js";
// * importamos Telegram-bot-api para utilizar la API de Telegram
import TelegramBotAPI from "node-telegram-bot-api";
import {
  changeName,
  handleUserMessages,
} from "./src/handlers/MessagesHandler.js";
import messageSender from "./src/senders/messageSender.js";
//import { botReplies } from "./src/messages/replies.js";
import {
  createNewUser,
  fetchCurrentUser,
} from "./src/database/databaseHandlers.js";
import { handleUserQueries } from "./src/handlers/queryHandler.js";
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
  INITIAL: "initial",
  WAITING_FOR_NEW_FIRST_NAME: "waiting_for_new_first_name",
  WAITING_FOR_EMAIL: "waiting_for_email",
  WAITING_FOR_USER_CURRENCY: "waiting_for_user_currency",
  WAITING_FOR_USER_INCOME_CATEGORIES: "waiting_for_user_income_categories",
  WAITING_FOR_USER_WITHDRAW_CATEGORIES: "waiting_for_user_withdraw_categories",
  WAITING_FOR_INITIAL_BALANCE: "waiting_for_initial_balance",
  WAITING_FOR_INITIAL_SAVINGS: "waiting_for_initial_savings",
  WAITING_FOR_EDIT_PROFILE: "waiting_for_edit_profile",
  WAITING_FOR_TRANSACTION_NAME: "waiting_for_transaction_name",
  WAITING_FOR_TRANSACTION_AMOUNT: "waiting_for_transaction_amount",
  WAITING_FOR_TYPE: "waiting_for_type",
  COMPLETED: "completed",
};

let newUserProfile = {};
let currentUser = {};
let newTransactionCategory = {};
let newUserRecord = {};
let editProfileObject = {};

bot.onText(/\/(\w+)/, async (msg, match) => {
  try {
    currentUser = await fetchCurrentUser(msg.from.id);
  } catch (error) {
    console.log("error haciendo fetch de current user desde index.js: ", error);
  }
  const command = match[1];
  await commandHandler(
    command,
    bot,
    msg,
    newUserProfile,
    userStates,
    STATES,
    currentUser,
    newTransactionCategory,
    newUserRecord
  );
});

bot.on("message", async (msg) => {
  try {
    currentUser = await fetchCurrentUser(msg.from.id);
  } catch (error) {
    console.log("error haciendo fetch de current user desde index.js: ", error);
  }
  // ! Si el mensaje es un comando, lo ignoramos aquí
  if (msg.text && msg.text.startsWith("/")) {
    return;
  }
  await handleUserMessages(
    bot,
    msg,
    newUserProfile,
    userStates,
    STATES,
    currentUser,
    newTransactionCategory,
    newUserRecord,
    editProfileObject
  );
});

bot.on("callback_query", async (query) => {
  handleUserQueries(
    query,
    bot,
    userStates,
    editProfileObject,
    STATES,
    newUserRecord,
    currentUser
  );
});
bot.on("polling_error", (msg) => console.log(msg));
