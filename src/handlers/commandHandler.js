import { fetchCurrentUser, fetchUsers } from "../database/databaseHandlers.js";
import { decryptText, generateUserIV } from "../helpers/encryptText.js";
import { botReplies } from "../messages/botMessages.js";

export default async function commandHandler(
  command,
  userManager,
  msg,
  currentUser,
  messageSender
) {
  const chatId = msg.from.id;
  let userProfile = {};
  let inline_keyboard = [];
  let newTextMessage = "";
  userManager.setUserProfile(chatId, await fetchCurrentUser(chatId))
  currentUser = await userManager.getUserProfile(chatId)
  switch (command.toLowerCase()) {
    case "start":
      const allUsers = await fetchUsers();
      let isUser = false;
      allUsers.forEach((user) => {
        if (user.telegram_id === chatId) {
          isUser = true;
        }
      });
      if (!isUser) {
        const newUserProfile = {}
        userManager.setUserStatus(chatId, "initial");
        newUserProfile.telegram_id = chatId;
        newUserProfile.first_name = msg.from.first_name;
        newUserProfile.last_name = msg.from.last_name;
        newUserProfile.telegram_username = msg.from.username;
        newUserProfile.user_iv = await generateUserIV();
        userManager.setNewUser(chatId, newUserProfile);
        await messageSender.sendTextMessage(chatId, botReplies[0], []);
        await new Promise((resolve) => setTimeout(resolve, 200));
        inline_keyboard = [
          [
            { text: "Esta bien asi", callback_data: "not-edit-first-name-btn" },
            { text: "Cambiarlo", callback_data: "edit-first-name-btn" },
          ],
        ];
        newTextMessage = botReplies[1].replace(
          "$username",
          msg.from.first_name
        );
        await messageSender.sendTextMessage(
          chatId,
          newTextMessage,
          inline_keyboard
        );
        userManager.setUserStatus(chatId, "initial");
      } else {
        userManager.setUserStatus(chatId, "initial");
        userProfile = await fetchCurrentUser(chatId);
        userManager.setUserProfile(chatId, userProfile);
        currentUser = userManager.getUserProfile(chatId);
        newTextMessage = botReplies[10].replace(
          "$username",
          await decryptText(currentUser.first_name)
        );
        await messageSender.sendTextMessage(chatId, newTextMessage, []);
        await new Promise((resolve) => setTimeout(resolve, 200));
        await messageSender.sendMenu(chatId)
      }

      return;
      case "menu":
        messageSender.sendMenu(chatId)
    default:
      break;
  }
}
/**
 * import { botReplies } from "../messages/botReplies.js";
import messageSender from "../senders/messageSender.js";
import {
  fetchUsers,
  createNewUser,
  fetchCurrentUser,
} from "../database/databaseHandlers.js";
import { changeName } from "./MessagesHandler.js";
import sendMenu from "../senders/menuSender.js";
import { decryptText, generateUserIV } from "../helpers/encryptText.js";
export default async function commandHandler(
  command,
    bot,
    msg,
    newUserProfile,
    userStates,
    STATES,
    currentUser,
    newTransactionCategory,
    newUserRecord,
    newUserCategory
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
        newUserProfile.user_iv = await generateUserIV()
        //await createNewUser(newUserProfile);
        await messageSender(chatId, botReplies[0], bot);
        await new Promise((resolve) => setTimeout(resolve, 200));
        await messageSender(
          chatId,
          botReplies[1].replace("%username", msg.from.first_name),
          bot
        );
      } else {
        currentUser = await fetchCurrentUser(msg.from.id);
        await messageSender(
          chatId,
          botReplies[10].replace("%username", decryptText(currentUser.first_name)),
          bot
        );
      }
      return;
    case "EstaBienAsi":
      await messageSender(
        chatId,
        botReplies[2].replace("%username", msg.from.first_name),
        bot
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender(chatId, botReplies[4], bot);
      userStates[chatId] = { state: STATES.WAITING_FOR_EMAIL };
      return;
    case "Cambiemoslo":
      userStates[chatId] = { state: STATES.WAITING_FOR_NEW_FIRST_NAME };
      await messageSender(chatId, botReplies[3], bot);
      return;
    case "ConfigurarEgresos":
      await messageSender(chatId, botReplies[12], bot);
      newTransactionCategory.type = "EGRESO";
      userStates[chatId] = {
        state: STATES.WAITING_FOR_USER_WITHDRAW_CATEGORIES,
      };
      return;
    case "hecho":
      await messageSender(chatId, botReplies[13], bot);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender(chatId, botReplies[14], bot);
      userStates[chatId] = { state: STATES.WAITING_FOR_INITIAL_BALANCE };
      return;
    case "menu":
      userStates[chatId] = { state: STATES.INITIAL }
      await sendMenu(msg.from.id, bot);
      break;
    default:
      break;
  }
}

 */
