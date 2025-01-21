import { fetchCurrentUser } from "../database/databaseHandlers.js";
import { botReplies } from "../messages/botReplies.js";
import sendMenu from "../senders/menuSender.js";
import {optionsEdit, optionsSend} from "../senders/optionsSender.js";

export async function handleUserQueries(query, bot, userStates, editProfileObject, STATES) {
  let inline_keyboard = [];
  let chatId = query.message.chat.id;
  let messageId = query.message.message_id;
  switch (query.data) {
    case "my_profile":
      const currentUser = await fetchCurrentUser(query.message.chat.id);
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
          .replace("$userFirstName", first_name || "")
          .replace("$userLastName", last_name || "")
          .replace("$userEmail ", email || "")
          .replace("$username", telegram_username)
          .replace("$userCurrency", currency),
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
            callback_data: "edit_name_btn"
          },
          {
            text: "Apellido",
            callback_data: "edit_lastname_btn"
          }
        ],
        [
          {
            text: "Email",
            callback_data: "edit_email_btn"
          }
        ],
        [
          {
            text: "⏪ Regresar a mi perfil",
            callback_data: "my_profile"
          }
        ]
      ]
      await optionsEdit(
        "¿Que deseas editar?",
        chatId,
        bot,
        inline_keyboard,
        messageId
      );
      return;
      case "edit_name_btn":
        userStates[query.message.chat.id] = { state: STATES.WAITING_FOR_EDIT_PROFILE }
        editProfileObject.category = "first_name"
        await optionsEdit(
          "Ingresa tu nuevo nombre:",
          chatId,
          bot,
          [[{
            text: "Cancelar",
            callback_data: "edit_profile"
          }]],
          messageId
        )
        return
    default:
      break;
  }
  console.log("query data: ", query.data);
}
