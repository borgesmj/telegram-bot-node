import { botReplies } from "../messages/botReplies.js";

export async function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { success: false, error: botReplies[7] };
  } else {
    return { success: true, error: "" };
  }
}

export async function validateText(text) {
  if (!text) {
    return { success: false, error: botReplies[9] };
  } else {
    return { success: true, error: "" };
  }
}

export async function validateIsNumber(text) {
  const regex = /^[0-9]+(\.[0-9]{2})?$/;
  let userInput = "";
  if (!text.includes(".")) {
    userInput = `${text}.00`;
  } else {
    userInput = text;
  }
  if (!regex.test(userInput)) {
    return { success: false, error: botReplies[15] , ammount: ""};
  } else {
    return { success: true, error: "" , ammount: Number(userInput)};
  }
}
