import { fetchCurrentUser, fetchUsers } from "../database/databaseHandlers.js";
import { decryptText, generateUserIV } from "../helpers/encryptText.js";
import { botErrorMessages } from "../messages/botErrorMessages.js";
import { botReplies } from "../messages/botMessages.js";
export default async function commandHandler(
  command,
  userManager,
  msg,
  currentUser,
  messageSender,
  baseUrl
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
        inline_keyboard = [
          [
            {
              text: "Terminos y condiciones",
              url: `${baseUrl}/terminos-y-condiciones`,
            },
            {
              text: "Politicas de privacidad",
              url: `${baseUrl}/politicas-de-privacidad`,
            },
          ],
          [
            {
              text: "Aceptar",
              callback_data: "accept-terms-and-conditions-btn",
            },
          ]
        ];
        await messageSender.sendTextMessage(chatId, botReplies[70], inline_keyboard);
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
      return;
    case "ayuda":
      newTextMessage = botReplies[69];
      inline_keyboard = [];
      for (let index = 0; index < 10; index++) {
        tempRow.push({
          text: `${index + 1}`,
          callback_data: `question-help-:${index}`,
        });
        if (tempRow.length === 5) {
          inline_keyboard.push(tempRow);
          tempRow = [];
        }
      }
      await messageSender.sendTextMessage(
        chatId,
        newTextMessage,
        inline_keyboard
      );
      return;
    default:
      break;
  }
}
