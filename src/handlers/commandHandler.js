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