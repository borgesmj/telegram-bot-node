import {
  fetchCurrentUserId,
  insertNewTransactionCategory,
} from "../database/databaseHandlers.js";
import { botReplies } from "../messages/botReplies.js";
import messageSender from "../senders/messageSender.js";
import { validateText } from "./validators.js";

export default async function addNewCategory(newTransactionCategory, msg, bot) {
  const checkText = await validateText(msg.text);
  if (!checkText.success) {
    await messageSender(msg.from.id, checkText.error, bot);
    return;
  }
  newTransactionCategory.name = msg.text;
  const currentUserId = await fetchCurrentUserId(msg.from.id);
  newTransactionCategory.user_id = currentUserId;
  const insertNewCategory = await insertNewTransactionCategory(
    newTransactionCategory
  );
  if (!insertNewCategory.success) {
    await messageSender(msg.from.id, insertNewCategory.error, bot);
    console.log("error, desde message hanlder");
  } else {
    if (newTransactionCategory.type === "INGRESO") {
      await messageSender(msg.from.id, botReplies[11], bot);
    } else {
      await messageSender(msg.from.id, botReplies[12], bot);
    }
  }
}
