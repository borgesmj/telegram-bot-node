import { fetchCurrentUser } from "../database/databaseHandlers.js";
import { botReplies } from "../messages/botReplies.js";
import sendMenu from "../senders/menuSender.js";
import messageSender from "../senders/messageSender.js";
import messageWithOptions from "../senders/optiosSender.js";

export async function handleUserQueries(query, bot) {
  switch (query.data) {
    case "my_profile":
      const currentUser = await fetchCurrentUser(query.message.chat.id);
      const { first_name, last_name, email, telegram_username, currency } =
        currentUser;
      const inline_keyboard = [
        [
          {
            text: "Editar Perfil",
            callback_data: "edit_profile",
          },
        ],
        [
          {
            text: "🔙 Regresar al menú principal",
            callback_data: "back_to_menu_btn",
          },
        ],
      ];
      messageWithOptions(
        botReplies[18]
          .replace("$userFirstName", first_name || "")
          .replace("$userLastName", last_name || "")
          .replace("$userEmail ", email || "")
          .replace("$username", telegram_username)
          .replace("$userCurrency", currency),
        query.message.chat.id,
        bot,
        inline_keyboard
      );
      return;
    case "back_to_menu_btn":
      await sendMenu(query.message.chat.id, bot);
      return;
    default:
      break;
  }
  console.log("query data: ", query.data);
}
