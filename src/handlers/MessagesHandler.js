import signInUser from "../auth/signIn.js";
import {
  createNewRecord,
  createNewSaving,
  createNewUser,
  editProfile,
  fetchCurrentUser,
  fetchCurrentUserId,
  insertNewTransactionCategory,
} from "../database/databaseHandlers.js";
import { botReplies } from "../messages/botReplies.js";
import sendMenu from "../senders/menuSender.js";
import messageSender from "../senders/messageSender.js";
import { optionsSend } from "../senders/optionsSender.js";
import sendSticker from "../senders/stickerSender.js";
import addNewCategory from "../utils/addNewCategory.js";
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

export async function handleUserMessages(
  bot,
  msg,
  userProfile,
  userStates,
  STATES,
  currentUser,
  newTransactionCategory,
  newUserRecord,
  editProfileObject
) {
  const validateUserInputText = await validateText(msg.text);
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
      editProfileObject.value = msg.text.toLowerCase();
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
      newUserRecord.date = new Date();
      console.log(newUserRecord);
    default:
      break;
  }
}
