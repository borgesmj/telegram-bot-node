import {
  createNewRecord,
  createNewSaving,
  fetchCurrentUser,
  fetchCurrentUserId,
  insertNewTransactionCategory,
} from "../database/databaseHandlers.js";
import { botErrorMessages } from "../messages/botErrorMessages.js";
import { botReplies } from "../messages/botMessages.js";
import { adjustToLocalTime } from "../utils/dateFormater.js";
import {
  validateEmail,
  validateIsNumber,
  validateText,
} from "../utils/validators.js";

export default async function handleUserMessages(
  msg,
  userManager,
  currentUser,
  messageSender
) {
  let inline_keyboard = [];
  let newTextMessage = "";
  let chatId = msg.from.id;
  currentUser = await fetchCurrentUser(chatId);
  let validatedText = null;
  let sendNewCategory = null;
  let newUserRecord = {};
  const currentUserStatus = userManager.getUserStatus(chatId);
  switch (currentUserStatus) {
    case "waiting-for-new-user-name":
      newTextMessage = botReplies[3].replace("$username", msg.text);
      await userManager.setUserProfile(chatId, {
        ...currentUser,
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
      await userManager.setUserProfile(chatId, {
        ...currentUser,
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
      await userManager.setUserProfile(chatId, {
        ...currentUser,
        currency: msg.text,
      });
      currentUser = userManager.getUserProfile(chatId);
      newTextMessage = botReplies[7]
        .replace("$first_name", currentUser.first_name || "")
        .replace("$user_lastname", currentUser.last_name || "")
        .replace("$username", `@${currentUser.telegram_username}`)
        .replace("$email", currentUser.email || "")
        .replace("$currency", currentUser.currency || "");
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
      newUserRecord.created_at = adjustToLocalTime(new Date());
      newUserRecord.user_id = await fetchCurrentUserId(msg.from.id);
      newUserRecord.category = "";
      newUserRecord.type = "INGRESO";
      const setInitialBalance = await createNewRecord(newUserRecord);
      if (!setInitialBalance.success) {
        await messageSender(msg.from.id, setInitialBalance.error, bot);
        return;
      }
      userManager.setUserStatus(chatId, "waiting_for_initial_savings");
      await messageSender.sendTextMessage(chatId, botReplies[16], []);
      return;
      case "waiting_for_initial_savings":
        const validateInitialSavings = await validateIsNumber(msg.text);
        if (!validateInitialSavings.success) {
          await messageSender(msg.from.id, validateInitialSavings.error, bot);
          return;
        }
        const initialSavings = {};
        initialSavings.ammount = validateInitialSavings.ammount;
        initialSavings.user_id = await fetchCurrentUserId(msg.from.id);
        const setInitialSavings = await createNewSaving(initialSavings);
        if (!setInitialSavings.success) {
          await messageSender(msg.from.id, setInitialSavings.error, bot);
          return;
        }
        await messageSender.sendSticker(chatId, "CAACAgIAAxkBAAIHDmeOm69HfXLndfrFKBK2HSfi4zdBAAJeEgAC7JkpSXzv2aVH92Q7NgQ")
        await new Promise((resolve) => setTimeout(resolve, 500));
        await messageSender.sendTextMessage(chatId, botReplies[17], [])
        await userManager.setUserStatus(chatId, "initial")
        await new Promise((resolve) => setTimeout(resolve, 300));
        await messageSender.sendMenu(chatId)
      return;
    default:
      break;
  }
}
/**
 * import signInUser from "../auth/signIn.js";
import {
  createNewRecord,
  createNewSaving,
  createNewUser,
  editProfile,
  fetchCurrentUser,
  fetchCurrentUserId,
  fetchUserCategories,
} from "../database/databaseHandlers.js";
import { encrypText } from "../helpers/encryptText.js";
import { botReplies } from "../messages/botReplies.js";
import sendMenu from "../senders/menuSender.js";
import messageSender from "../senders/messageSender.js";
import { optionsSend, sendConfirmation } from "../senders/optionsSender.js";
import sendSticker from "../senders/stickerSender.js";
import addNewCategory from "../utils/addNewCategory.js";
import numberFormater from "../utils/numberFormater.js";
import {
  validateEmail,
  validateIsNumber,
  validateText,
} from "../utils/validators.js";

export function changeName(userProfile, msg) {
  userProfile.first_name = msg.text;
  return userProfile;
}

function changeUserEmail(userProfile, msg) {
  userProfile.email = msg.text;
  return userProfile;
}

export default async function handleUserMessages(
  bot,
  msg,
  newUserProfile,
  userStates,
  STATES,
  currentUser,
  newTransactionCategory,
  newUserRecord,
  editProfileObject,
  newUserCategory,
  editCategoryObject
) {
  const validateUserInputText = await validateText(msg.text);
  let confirmationMessage = "";
  if (!validateUserInputText.success) {
    await messageSender(msg.from.id, validateUserInputText.error, bot);
    return;
  }
  switch (userStates[msg.from.id]?.state) {
    case "waiting_for_email":
      const validateInputEmail = await validateEmail(msg.text);
      if (!validateInputEmail.success) {
        await messageSender(msg.from.id, validateInputEmail.error, bot);
        return;
      } else {
        userProfile.email = msg.text;
        await messageSender(
          msg.from.id,
          botReplies[6].replace("%email", msg.text),
          bot
        );
        await new Promise((resolve) => setTimeout(resolve, 300));
        await messageSender(msg.from.id, botReplies[8], bot);
        userStates[msg.from.id] = { state: STATES.WAITING_FOR_USER_CURRENCY };
      }
      break;
    case "waiting_for_user_currency":
      userProfile.currency = msg.text;
      //await signInUser(userProfile);
      await createNewUser(msg.from.id, userProfile);
      await messageSender(msg.from.id, botReplies[5], bot);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender(msg.from.id, botReplies[11], bot);
      newTransactionCategory.type = "INGRESO";
      newTransactionCategory.user_id = await fetchCurrentUserId(msg.from.id);
      userStates[msg.from.id] = {
        state: STATES.WAITING_FOR_USER_INCOME_CATEGORIES,
      };
      break;
    case "waiting_for_new_first_name":
      userProfile.first_name = msg.text;
      await messageSender(
        msg.from.id,
        botReplies[2].replace("%username", msg.text),
        bot
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender(msg.from.id, botReplies[4], bot);
      userStates[msg.from.id] = { state: STATES.WAITING_FOR_EMAIL };
      break;
    case "waiting_for_user_income_categories":
      addNewCategory(newTransactionCategory, msg, bot);
      break;
    case "waiting_for_user_withdraw_categories":
      addNewCategory(newTransactionCategory, msg, bot);
      break;
    case "waiting_for_initial_balance":
      const validateInitialBalance = await validateIsNumber(msg.text);
      if (!validateInitialBalance.success) {
        await messageSender(msg.from.id, validateInitialBalance.error, bot);
        return;
      }
      newUserRecord.details = "Balance Inicial";
      newUserRecord.ammount = validateInitialBalance.ammount;
      newUserRecord.created_at = new Date();
      newUserRecord.user_id = await fetchCurrentUserId(msg.from.id);
      newUserRecord.category = "";
      newUserRecord.type = "INGRESO";
      const setInitialBalance = await createNewRecord(newUserRecord);
      if (!setInitialBalance.success) {
        await messageSender(msg.from.id, setInitialBalance.error, bot);
        return;
      }
      userStates[msg.from.id] = { state: STATES.WAITING_FOR_INITIAL_SAVINGS };
      await messageSender(msg.from.id, botReplies[16], bot);
      break;
    case "waiting_for_initial_savings":
      const validateInitialSavings = await validateIsNumber(msg.text);
      if (!validateInitialSavings.success) {
        await messageSender(msg.from.id, validateInitialSavings.error, bot);
        return;
      }
      const initialSavings = {};
      initialSavings.ammount = validateInitialSavings.ammount;
      initialSavings.user_id = await fetchCurrentUserId(msg.from.id);
      const setInitialSavings = await createNewSaving(initialSavings);
      if (!setInitialSavings.success) {
        await messageSender(msg.from.id, setInitialSavings.error, bot);
        return;
      }
      await sendSticker(
        bot,
        msg.from.id,
        "CAACAgIAAxkBAAIHDmeOm69HfXLndfrFKBK2HSfi4zdBAAJeEgAC7JkpSXzv2aVH92Q7NgQ"
      );
      await messageSender(msg.from.id, botReplies[17], bot);
      userStates[msg.from.id] = { state: STATES.COMPLETED };
      await new Promise((resolve) => setTimeout(resolve, 300));
      await sendMenu(msg.from.id, bot);
      break;
    case "waiting_for_edit_profile":
      const validateUserInputText = await validateText(msg.text);
      if (!validateUserInputText.success) {
        await messageSender(msg.from.id, validateUserInputText.error, bot);
        return;
      }
      editProfileObject.value = encrypText(
        msg.text.toLowerCase(),
        currentUser.user_iv
      );
      const editProfileData = await editProfile(editProfileObject, msg.from.id);
      if (!editProfileData.success) {
        await messageSender(msg.from.id, editProfileData.error, bot);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await sendMenu(msg.from.id, bot);
        return;
      }
      await messageSender(msg.from.id, botReplies[19], bot);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await sendMenu(msg.from.id, bot);
      userStates[msg.from.id] = { state: STATES.COMPLETED };
      break;
    case "waiting_for_transaction_name":
      const validateTransactionName = await validateText(msg.text);
      if (!validateTransactionName.success) {
        await messageSender(msg.from.id, validateTransactionName.error, bot);
        return;
      }
      newUserRecord.details = msg.text;
      const currentUserId = await fetchCurrentUserId(msg.from.id);
      newUserRecord.user_id = currentUserId;
      await optionsSend(botReplies[23], msg.from.id, bot, [
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ]);
      userStates[msg.from.id] = {
        state: STATES.WAITING_FOR_TRANSACTION_AMOUNT,
      };
      break;
    case "waiting_for_transaction_amount":
      const validateTransactionAmount = await validateIsNumber(msg.text);
      if (!validateTransactionAmount.success) {
        await messageSender(msg.from.id, validateTransactionAmount.error, bot);
        return;
      }
      newUserRecord.ammount = validateTransactionAmount.ammount;
      newUserRecord.created_at = new Date();
      let userCategories = [];
      userCategories = await fetchUserCategories(
        msg.from.id,
        newUserRecord.type
      );
      let inline_keyboard = [];
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
      await optionsSend(botReplies[25], msg.from.id, bot, inline_keyboard);
      return;
    case "waiting_for_new_savings":
      const validateNewSavings = await validateIsNumber(msg.text);
      if (!validateNewSavings.success) {
        await messageSender(msg.from.id, validateNewSavings.error, bot);
        return;
      }
      newUserRecord.ammount = validateNewSavings.ammount;
      newUserRecord.user_id = await fetchCurrentUserId(msg.from.id);
      newUserRecord.created_at = new Date();
      confirmationMessage = botReplies[29].replace(
        "$ammount",
        await numberFormater(newUserRecord.ammount, currentUser.currency)
      );
      userStates[msg.from.id] = STATES.WAITING_FOR_CONFIRMATION;
      await sendConfirmation(
        confirmationMessage,
        "confirm_new_savings_btn",
        bot,
        msg.from.id
      );
      return;
    case "waiting_for_new_category":
      const validateNewCategory = await validateText(msg.text);
      if (!validateNewCategory.success) {
        await messageSender(msg.from.id, validateNewCategory.error, bot);
        return;
      }
      newUserCategory.name = msg.text;
      userStates[msg.from.id] = { state: STATES.WAITING_FOR_CONFIRMATION };
      sendConfirmation(
        botReplies[38]
          .replace("$category", msg.text)
          .replace("$type", newUserCategory.type),
        "confirm_add_new_category_btn",
        bot,
        msg.from.id
      );
      return;
    case "waiting_for_category_edit":
      const validateEditCategory = await validateText(msg.text);
      if (!validateEditCategory.success) {
        await messageSender(msg.from.id, validateEditCategory.error, bot);
      }
      editCategoryObject.newName = msg.text;
      userStates[msg.from.id] = { state: STATES.WAITING_FOR_CONFIRMATION };
      sendConfirmation(
        botReplies[43]
          .replace("$oldname", editCategoryObject.oldName)
          .replace("$newname", editCategoryObject.newName),
        "confirm_edit_category_name",
        bot,
        msg.from.id
      );
      return;
    default:
      break;
  }
}

 */
