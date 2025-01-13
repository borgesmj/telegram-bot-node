import { botReplies } from "../messages/replies.js";
import messageSender from "../senders/messageSender.js";
import { fetchUsers, createNewUser } from "../database/databaseHandlers.js";
export default async function commandHandler(command, bot, msg) {
  const chatId = msg.chat.id;
  switch (command) {
    case "start":
      const allUsers = await fetchUsers();
      let isUser = false;
      allUsers.forEach((user) => {
        if (user.telegram_id === chatId) {
          isUser = true;
        }
      });
      if (!isUser) {
        messageSender(
          chatId,
          botReplies[0].replace("%username", msg.from.first_name),
          bot
        );
        createNewUser(chatId, msg.chat.first_name);
      } else{
        messageSender(chatId, "Ya estás registrado", bot)
      }
    default:
      break;
  }
}
