import signInUser from "../auth/signIn.js";
import {
  createNewRecord,
  createNewSaving,
  createNewUser,
  fetchCurrentUser,
  fetchCurrentUserId,
  insertNewTransactionCategory,
} from "../database/databaseHandlers.js";
import { botReplies } from "../messages/botReplies.js";
import sendMenu from "../senders/menuSender.js";
import messageSender from "../senders/messageSender.js";
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
  newUserRecord
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
      await sendMenu(msg.from.id, bot)
      break;
    default:
      break;
  }
}
