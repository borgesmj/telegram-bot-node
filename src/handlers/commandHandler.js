import { botReplies } from "../messages/botReplies.js";
import messageSender from "../senders/messageSender.js";
import { fetchUsers, createNewUser, fetchCurrentUser } from "../database/databaseHandlers.js";
import { changeName } from "./MessagesHandler.js";
export default async function commandHandler(
  command,
  bot,
  msg,
  newUserProfile,
  userStates,
  STATES,
  currentUser
) {
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
        newUserProfile.telegram_id = msg.from.id;
        newUserProfile.first_name = msg.from.first_name;
        newUserProfile.last_name = msg.from.last_name;
        newUserProfile.username = msg.from.username;
        //await createNewUser(newUserProfile);
        await messageSender(chatId, botReplies[0], bot);
        await new Promise(resolve => setTimeout(resolve, 200)); 
        await messageSender(
          chatId,
          botReplies[1].replace("%username", msg.from.first_name),
          bot
        );
      } else {
        currentUser = await fetchCurrentUser(msg.from.id)
        await messageSender(chatId, botReplies[10].replace("%username", currentUser.first_name), bot);
      }
      return;
    case "EstaBienAsi":
      await messageSender(
        chatId,
        botReplies[2].replace("%username", msg.from.first_name),
        bot
      );
      await new Promise(resolve => setTimeout(resolve, 300)); 
      await messageSender(chatId, botReplies[4], bot);
      userStates[chatId] = {state: STATES.WAITING_FOR_EMAIL};
      return;
    case "Cambiemoslo":
      userStates[chatId] = { state: STATES.WAITING_FOR_NEW_FIRST_NAME };
      await messageSender(chatId, botReplies[3], bot);
      return;
    default:
      break;
  }
}
