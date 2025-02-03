import { fetchCurrentUser, fetchUsers } from "../database/databaseHandlers.js";
import { decryptText, generateUserIV } from "../helpers/encryptText.js";
import { botErrorMessages } from "../messages/botErrorMessages.js";
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
  let tempRow = [];
  userManager.setUserProfile(chatId, await fetchCurrentUser(chatId));
  currentUser = await userManager.getUserProfile(chatId);
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
        if (!msg.from.username) {
          await messageSender.sendTextMessage(chatId, botErrorMessages[2], []);
          await new Promise((resolve) => setTimeout(resolve, 500));
          await messageSender.sendTextMessage(
            chatId,
            "Si necesitas mas información, utiliza el comando /ayuda",
            []
          );
          return;
        } else {
          const newUserProfile = {};
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
              {
                text: "Esta bien asi",
                callback_data: "not-edit-first-name-btn",
              },
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
        }
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
        await messageSender.sendMenu(chatId);
      }

      return;
    case "menu":
      if (!msg.from.username) {
        await messageSender.sendTextMessage(chatId, botErrorMessages[2], []);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await messageSender.sendTextMessage(
          chatId,
          "Si necesitas mas información, utiliza el comando /ayuda",
          []
        );
        return;
      }
      messageSender.sendMenu(chatId, await currentUser.ROLE);
      return
    case "ayuda":
      newTextMessage = botReplies[69];
      inline_keyboard = []
      for (let index = 0; index < 10; index++){
        tempRow.push({
          text: `${index+1}`,
          callback_data: `question-help-:${index}`
        })
        if (tempRow.length === 5){
          inline_keyboard.push(tempRow)
          tempRow = []
        }
      }
      await messageSender.sendTextMessage(chatId, newTextMessage, inline_keyboard);
      return;
    default:
      break;
  }
}
