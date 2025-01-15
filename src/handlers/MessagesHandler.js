import signInUser from "../auth/signIn.js";
import { createNewUser } from "../database/databaseHandlers.js";
import { botReplies } from "../messages/botReplies.js";
import messageSender from "../senders/messageSender.js";
import { validateEmail, validateText } from "../utils/validators.js";

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
  STATES
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
      await signInUser(userProfile);
      await createNewUser(msg.from.id, userProfile);
      await messageSender(msg.from.id, botReplies[5], bot);
      userStates[msg.from.id] = { state: STATES.COMPLETED };
      break;
    case "waiting_for_new_first_name":
      userProfile.first_name = msg.text;
      await messageSender(msg.from.id, botReplies[2].replace("%username", msg.text), bot);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender(msg.from.id, botReplies[4], bot);
      userStates[msg.from.id] = { state: STATES.WAITING_FOR_EMAIL };
      break;
    default:
      break;
  }
}
