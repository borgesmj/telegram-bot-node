import {
  createNewRecord,
  fetchCurrentUser,
} from "../database/databaseHandlers.js";
import { botReplies } from "../messages/botReplies.js";
import sendMenu from "../senders/menuSender.js";
import messageSender from "../senders/messageSender.js";
import { optionsEdit, optionsSend } from "../senders/optionsSender.js";
import sendSticker from "../senders/stickerSender.js";
import capitalizeWords from "../utils/capitalizeWords.js";
import numberFormater from "../utils/numberFormater.js";

export async function handleUserQueries(
  query,
  bot,
  userStates,
  editProfileObject,
  STATES,
  newUserRecord
) {
  let inline_keyboard = [];
  let chatId = query.message.chat.id;
  let messageId = query.message.message_id;
  const currentUser = await fetchCurrentUser(query.message.chat.id);
  switch (query.data) {
    case "my_profile":
      const { first_name, last_name, email, telegram_username, currency } =
        currentUser;
      inline_keyboard = [
        [
          {
            text: "Editar Perfil",
            callback_data: "edit_profile",
          },
        ],
        [
          {
            text: "⏪ Regresar al menú principal",
            callback_data: "back_to_menu_btn",
          },
        ],
      ];
      optionsEdit(
        botReplies[18]
          .replace("$userFirstName", (await capitalizeWords(first_name)) || "")
          .replace("$userLastName", (await capitalizeWords(last_name)) || "")
          .replace("$userEmail ", email || "")
          .replace("$username", `@${telegram_username}` || "")
          .replace("$userCurrency", currency || ""),
        chatId,
        bot,
        inline_keyboard,
        messageId
      );
      return;
    case "back_to_menu_btn":
      (inline_keyboard = [
        [{ text: "Nuevo Ingreso", callback_data: "new_income" }],
        [{ text: "Nuevo Retiro", callback_data: "new_withdraw" }],
        [{ text: "Nuevo Ahorro", callback_data: "new_savings" }],
        [{ text: "Ver movimientos", callback_data: "see_records" }],
        [{ text: "Ver saldos", callback_data: "see_balances" }],
        [{ text: "Mi Perfil", callback_data: "my_profile" }],
        [{ text: "Info de este bot", callback_data: "about_bot" }],
      ]),
        await optionsEdit(
          "*Menu Principal* 📋",
          chatId,
          bot,
          inline_keyboard,
          messageId
        );
      return;
    case "edit_profile":
      inline_keyboard = [
        [
          {
            text: "Nombre",
            callback_data: "edit_name_btn",
          },
          {
            text: "Apellido",
            callback_data: "edit_lastname_btn",
          },
        ],
        [
          {
            text: "Email",
            callback_data: "edit_email_btn",
          },
        ],
        [
          {
            text: "Agregar categorias",
            callback_data: "edit_categories_btn",
          },
        ],
        [
          {
            text: "⏪ Regresar a mi perfil",
            callback_data: "my_profile",
          },
        ],
      ];
      await optionsEdit(
        "¿Que deseas editar?",
        chatId,
        bot,
        inline_keyboard,
        messageId
      );
      return;
    case "edit_name_btn":
      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_EDIT_PROFILE,
      };
      editProfileObject.category = "first_name";
      await optionsEdit(
        "Ingresa tu nuevo nombre:",
        chatId,
        bot,
        [
          [
            {
              text: "Cancelar",
              callback_data: "edit_profile",
            },
          ],
        ],
        messageId
      );
      return;
    case "edit_lastname_btn":
      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_EDIT_PROFILE,
      };
      editProfileObject.category = "last_name";
      await optionsEdit(
        "Ingresa tu nuevo apellido:",
        chatId,
        bot,
        [
          [
            {
              text: "Cancelar",
              callback_data: "edit_profile",
            },
          ],
        ],
        messageId
      );
      return;
    case "edit_email_btn":
      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_EDIT_PROFILE,
      };
      editProfileObject.category = "email";
      await optionsEdit(
        "Ingresa tu nuevo email:",
        chatId,
        bot,
        [
          [
            {
              text: "Cancelar",
              callback_data: "edit_profile",
            },
          ],
        ],
        messageId
      );
      return;
    case "new_income":
      newUserRecord.type = "INGRESO";
      await optionsEdit(
        botReplies[22],
        query.message.chat.id,
        bot,
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );

      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_TRANSACTION_NAME,
      };
      return;
    case "new_withdraw":
      newUserRecord.type = "EGRESO";
      await optionsEdit(
        botReplies[24],
        query.message.chat.id,
        bot,
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );

      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_TRANSACTION_NAME,
      };
      return;
    case "confirm_transaction":
      const sendNewTransaction = await createNewRecord(newUserRecord);
      if (!sendNewTransaction.success) {
        await messageSender(
          query.message.chat.id,
          sendNewTransaction.error,
          bot
        );
        return;
      }
      newUserRecord = {};
      await sendSticker(
        bot,
        query.message.chat.id,
        "CAACAgIAAxkBAAIKrGeRBX-8sa-q0WyXSKJDdRKDRiIGAAL-AANWnb0K2gRhMC751_82BA"
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender(query.message.chat.id, "Transaccion guardadda", bot);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await sendMenu(query.message.chat.id, bot);
      userStates[query.message.chat.id] = { state: STATES.COMPLETED };
      break;
    case "new_savings":
      newUserRecord.type = "AHORROS";
      newUserRecord.details = "Nuevos ahorros";
      newUserRecord.user_id = currentUser.id;
      inline_keyboard = [
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_NEW_SAVINGS,
      };
      await optionsEdit(
        botReplies[27],
        query.message.chat.id,
        bot,
        inline_keyboard,
        messageId
      );
      return;
    default:
      if (query.data.startsWith("category-selection-option")) {
        newUserRecord.category = query.data.split(":")[1];
      }
      inline_keyboard = [
        [
          {
            text: "Confirmar",
            callback_data: "confirm_transaction",
          },
        ],
        [
          {
            text: "Cancelar",
            callback_data: "back_to_menu_btn",
          },
        ],
      ];
      const { type, details, ammount, category } = newUserRecord;
      optionsEdit(
        botReplies[26]
          .replace("$type", type)
          .replace("$details", details)
          .replace("$ammount", `${await numberFormater(ammount, currentUser.currency)}`)
          .replace("$category", category),
        query.message.chat.id,
        bot,
        inline_keyboard,
        query.message.message_id
      );
      break;
  }
  console.log("query data: ", query.data);
}
