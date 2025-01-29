import {
  fetchCurrentUser,
  fetchUserCategories,
  insertNewTransactionCategory,
} from "../database/databaseHandlers.js";
import { botErrorMessages } from "../messages/botErrorMessages.js";
import { botReplies } from "../messages/botMessages.js";
import {
  validateEmail,
  validateIsNumber,
  validateText,
} from "../utils/validators.js";
import numberFormater from "../utils/numberFormater.js";
import { decryptText } from "../helpers/encryptText.js";
export default async function handleUserMessages(
  msg,
  userManager,
  currentUser,
  messageSender
) {
  let inline_keyboard = [];
  let newTextMessage = "";
  let chatId = msg.from.id;
  let inputText = null;
  let inputNumber = null;
  let confirmationMessage = "";
  userManager.setUserProfile(chatId, await fetchCurrentUser(chatId));
  currentUser = await userManager.getUserProfile(chatId);
  let validatedText = null;
  let sendNewCategory = null;
  let newUserRecord = {};
  const currentUserStatus = userManager.getUserStatus(chatId);
  switch (currentUserStatus) {
    case "waiting-for-new-user-name":
      newTextMessage = botReplies[3].replace("$username", msg.text);
      await userManager.setNewUser(chatId, {
        ...userManager.getNewUser(chatId),
        first_name: msg.text,
      });
      await messageSender.sendTextMessage(chatId, newTextMessage, []);
      await new Promise((resolve) => setTimeout(resolve, 200));
      await messageSender.sendTextMessage(chatId, botReplies[4], []);
      await userManager.setUserStatus(chatId, "waiting-for-new-email");
      return;
    case "waiting-for-new-email":
      const emailValidate = await validateEmail(msg.text);
      if (!emailValidate.success) {
        newTextMessage = botErrorMessages[0];
        await messageSender.sendTextMessage(chatId, newTextMessage, []);
        return;
      }
      newTextMessage = botReplies[5].replace("$email", msg.text);
      await userManager.setNewUser(chatId, {
        ...userManager.getNewUser(chatId),
        email: msg.text,
      });
      await userManager.setUserStatus(chatId, "waiting_for_new_currency");
      await new Promise((resolve) => setTimeout(resolve, 200));
      await messageSender.sendTextMessage(chatId, newTextMessage, []);
      return;
    case "waiting_for_new_currency":
      validatedText = validateText(msg.text);
      if (validatedText.success) {
        newTextMessage = botErrorMessages[1];
        await messageSender.sendTextMessage(chatId, newTextMessage, []);
        return;
      }
      await userManager.setNewUser(chatId, {
        ...userManager.getNewUser(chatId),
        currency: msg.text,
      });
      newTextMessage = botReplies[7]
        .replace("$first_name", userManager.getNewUser(chatId).first_name || "")
        .replace(
          "$user_lastname",
          userManager.getNewUser(chatId).last_name || ""
        )
        .replace(
          "$username",
          `@${userManager.getNewUser(chatId).telegram_username}`
        )
        .replace("$email", userManager.getNewUser(chatId).email || "")
        .replace("$currency", userManager.getNewUser(chatId).currency || "");
      inline_keyboard = [
        [
          { text: "Confirmar", callback_data: "confirm_new_profile_btn" },
          {
            text: "Comenzar de nuevo",
            callback_data: "start_over_new_profile_btn",
          },
        ],
      ];
      await userManager.setUserStatus(chatId, "waiting_for_confirmation");
      await messageSender.sendTextMessage(
        chatId,
        newTextMessage,
        inline_keyboard
      );
      return;
    case "waiting_for_new_income_categories":
      validatedText = validateText(msg.text);
      if (!validatedText) {
        await messageSender.sendTextMessage(chatId, text, inline_keyboard);
      }
      sendNewCategory = await insertNewTransactionCategory({
        name: msg.text,
        user_id: currentUser.id,
        type: "INGRESO",
      });
      if (!sendNewCategory.success) {
        await messageSender.sendTextMessage(
          chatId,
          sendNewCategory.error,
          inline_keyboard
        );
        return;
      }
      newTextMessage = botReplies[12].replace("$category", msg.text);
      inline_keyboard = [
        [
          {
            text: "Configurar categorias de egresos",
            callback_data: "set_expenses_categories_btn",
          },
        ],
      ];
      messageSender.sendTextMessage(chatId, newTextMessage, inline_keyboard);
      return;
    case "waiting_for_expenses_categories":
      validatedText = validateText(msg.text);
      if (!validatedText) {
        await messageSender.sendTextMessage(chatId, text, inline_keyboard);
      }
      sendNewCategory = await insertNewTransactionCategory({
        name: msg.text,
        user_id: currentUser.id,
        type: "EGRESO",
      });
      if (!sendNewCategory.success) {
        await messageSender.sendTextMessage(
          chatId,
          sendNewCategory.error,
          inline_keyboard
        );
        return;
      }
      newTextMessage = botReplies[12].replace("$category", msg.text);
      inline_keyboard = [
        [
          {
            text: "Finalizar",
            callback_data: "end_categories_configuration_btn",
          },
        ],
      ];
      messageSender.sendTextMessage(chatId, newTextMessage, inline_keyboard);
      return;
    case "waiting_for_initial_balance":
      const validateInitialBalance = await validateIsNumber(msg.text);
      if (!validateInitialBalance.success) {
        await messageSender.sendTextMessage(
          chatId,
          validateInitialBalance.error,
          []
        );
        return;
      }
      newUserRecord.details = "Balance Inicial";
      newUserRecord.ammount = validateInitialBalance.ammount;
      newUserRecord.user_id = currentUser.id;
      newUserRecord.category = "";
      newUserRecord.type = "INGRESO";
      newTextMessage = botReplies[18].replace(
        "$ammount",
        await numberFormater(
          validateInitialBalance.ammount,
          currentUser.currency
        )
      );
      inline_keyboard = [
        [
          {
            text: "Confirmo el monto",
            callback_data: "confirm_initial_balance_btn",
          },
          {
            text: "Escribir otro monto",
            callback_data: "reset_new_initial_balance_btn",
          },
        ],
      ];
      userManager.setUserStatus(chatId, "waiting_for_confirmation");
      userManager.setUserAmmount(chatId, validateInitialBalance.ammount);
      userManager.setUserTransaction(chatId, newUserRecord);
      messageSender.sendTextMessage(chatId, newTextMessage, inline_keyboard);
      return;
    case "waiting_for_initial_savings":
      const validateInitialSavings = await validateIsNumber(msg.text);
      if (!validateInitialSavings.success) {
        await messageSender(msg.from.id, validateInitialSavings.error, bot);
        return;
      }
      newUserRecord.details = "Ahorros iniciales";
      newUserRecord.ammount = validateInitialSavings.ammount;
      newUserRecord.user_id = currentUser.id;
      newUserRecord.category = "";
      newUserRecord.type = "AHORROS";
      userManager.setUserStatus(chatId, "waiting_for_confirmation");
      userManager.setUserTransaction(chatId, newUserRecord);
      newTextMessage = botReplies[20].replace(
        "$ammount",
        await numberFormater(
          validateInitialSavings.ammount,
          currentUser.currency
        )
      );
      inline_keyboard = [
        [
          {
            text: "Confirmo el monto",
            callback_data: "confirm_initial_savings_btn",
          },
          {
            text: "Escribir otro monto",
            callback_data: "reset_new_initial_savings_btn",
          },
        ],
      ];
      messageSender.sendTextMessage(chatId, newTextMessage, inline_keyboard);
      return;
    case "waiting_for_transaction_name":
      inputText = await validateText(msg.text);
      if (!inputText.success) {
        await messageSender.sendTextMessage(chatId, inputText.error, []);
        return;
      }
      userManager.setUserTransaction(chatId, {
        ...userManager.getUserTransaction(chatId),
        details: msg.text,
      });
      userManager.setUserStatus(chatId, "waiting_for_transaction_amount");
      messageSender.sendTextMessage(chatId, botReplies[24], [
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ]);
      return;
    case "waiting_for_transaction_amount":
      inputNumber = await validateIsNumber(msg.text);
      if (!inputNumber.success) {
        await messageSender.sendTextMessage(chatId, inputNumber.error, []);
        return;
      }
      userManager.setUserTransaction(chatId, {
        ...userManager.getUserTransaction(chatId),
        ammount: inputNumber.ammount,
      });
      let userCategories = [];
      let transactionType = userManager.getUserTransaction(chatId).type;
      userCategories = await fetchUserCategories(chatId, transactionType);
      inline_keyboard = [];
      let tempRow = [];

      userCategories.forEach((category, index) => {
        tempRow.push({
          text: category.name,
          callback_data: `category-selection-option:${category.name}`,
        });
        if (tempRow.length === 2 || index === userCategories.length - 1) {
          inline_keyboard.push(tempRow);
          tempRow = [];
        }
      });
      inline_keyboard.push([
        {
          text: "Cancelar",
          callback_data: "back_to_menu_btn",
        },
      ]);
      messageSender.sendTextMessage(chatId, botReplies[25], inline_keyboard);
      return;
    case "waiting_for_new_savings":
      inputNumber = await validateIsNumber(msg.text);
      if (!inputNumber.success) {
        await messageSender(msg.from.id, inputNumber.error, bot);
        return;
      }
      await userManager.setUserTransaction(chatId, {
        ...userManager.getUserTransaction(chatId),
        ammount: inputNumber.ammount,
      });
      confirmationMessage = botReplies[30].replace(
        "$ammount",
        await numberFormater(inputNumber.ammount, currentUser.currency)
      );
      await userManager.setUserStatus(chatId, "waiting_for_confirmation");
      inline_keyboard = [
        [
          {
            text: "Confirmar",
            callback_data: "confirm_new_savings_btn",
          },
          {
            text: "Cancelar",
            callback_data: "back_to_menu_btn",
          },
        ],
      ];
      await messageSender.sendTextMessage(
        chatId,
        confirmationMessage,
        inline_keyboard
      );
      return;
    case "waiting_for_new_profile_data":
      inputText = await validateText(msg.text);
      if (!inputText.success) {
        await messageSender.sendTextMessage(chatId, inputText.error, []);
        return;
      }
      await userManager.setEditProfile(chatId, {
        ...userManager.getEditProfile(chatId),
        value: msg.text,
      });
      let editCategory = await userManager.getEditProfile(chatId).category;
      newTextMessage = botReplies[46]
        .replace("$oldname", await decryptText(currentUser[editCategory] || ""))
        .replace("$newname", msg.text)
        .replace(
          "$category",
          editCategory === "first_name"
            ? "nombre"
            : editCategory === "last_name"
            ? "apellido"
            : "correo"
        );
      inline_keyboard = [
        [{ text: "Confirmar", callback_data: "confirm_new_profile_data_btn" }],
        [{ text: "Cancelar", callback_data: "my_profile" }],
      ];
      await messageSender.sendTextMessage(
        chatId,
        newTextMessage,
        inline_keyboard
      );
      await userManager.setUserStatus(chatId, "waiting_for_confirmation");
      return;
    case "waiting_for_category_edit":
      inputText = await validateText(msg.text);
      if (!inputText.success) {
        await messageSender(msg.from.id, inputText.error, bot);
      }
      userManager.setEditProfile(chatId, {
        ...userManager.getEditProfile(chatId),
        newName: msg.text,
      });
      userManager.setUserStatus(chatId, "waiting_for_confirmation");
      (newTextMessage = botReplies[53]
        .replace("$oldname", userManager.getEditProfile(chatId).oldName)
        .replace("$newname", userManager.getEditProfile(chatId).newName)),
        (inline_keyboard = [
          [{ text: "Confirmar", callback_data: "confirm_category_edit_btn" }],
          [{ text: "Cancelar", callback_data: "my_profile" }],
        ]);
      messageSender.sendTextMessage(chatId, newTextMessage, inline_keyboard);
      return;
    case "waiting_for_new_category":
      inputText = await validateText(msg.text);
      if (!inputText.success) {
        await messageSender(msg.from.id, inputText.error, bot);
        return;
      }
      await userManager.setEditProfile(chatId, {
        ...userManager.getEditProfile(chatId),
        name: msg.text,
      });
      await userManager.setUserStatus(chatId, "waiting_for_confimation");
      inline_keyboard = [
        [{ text: "Confirmar", callback_data: "confirm_add_new_category_btn" }],
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      newTextMessage = botReplies[57]
        .replace("$category", msg.text)
        .replace("$type", userManager.getEditProfile(chatId).type);
      messageSender.sendTextMessage(chatId, newTextMessage, inline_keyboard);
      return;
    case "waiting_for_new_savings_withdraw":
      inputNumber = await validateIsNumber(msg.text);
      if (!inputNumber.success) {
        await messageSender.sendTextMessage(chatId, inputNumber.error, []);
        return;
      }
      const negativeAmmount = -inputNumber.ammount;
      await userManager.setUserTransaction(chatId, {
        user_id: currentUser.id,
        ammount: negativeAmmount
      });
      userManager.setUserStatus(chatId, "waiting_for_confirmation");
      inline_keyboard = [
        [
          {
            text: "Confirmar",
            callback_data: "confirm_new_savings_withdraw_btn",
          },
        ],
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      newTextMessage = botReplies[63].replace(
        "$ammount",
        await numberFormater(inputNumber.ammount, currentUser.currency)
      );
      messageSender.sendTextMessage(chatId, newTextMessage, inline_keyboard);
      return;
    default:
      break;
  }
}
