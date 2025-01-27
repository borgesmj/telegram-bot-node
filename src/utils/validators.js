import { botErrorMessages, } from "../messages/botErrorMessages.js";
import { botReplies } from "../messages/botMessages.js";

export async function validateEmail(email) {
  if (email.length > 50) {
    return {
      success: false,
      error: "🤖\n\nEl email que quieres guardar es demasiado largo",
    };
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { success: false, error: botErrorMessages[0] };
  } else {
    return { success: true, error: "" };
  }
}

export async function validateText(text) {
  if (!text) {
    return { success: false, error: botReplies[9] };
  } else if (text.length > 250) {
    return {
      success: false,
      error: "🤖\n\nEl texto que quieres introducir es demasiado largo",
    };
  } else {
    return { success: true, error: "" };
  }
}

export async function validateIsNumber(text) {
  if (text.length > 13){
    return {success: false, error: "🤖\n\nEl numero que quieres introducir es demasiado largo\n\nEl numero puede tener hasta 10 digitos y  2 decimales"}
  }
  const regex = /^[0-9]+(\.[0-9]{2})?$/;
  let userInput = "";
  if (!text.includes(".")) {
    userInput = `${text}.00`;
  } else {
    userInput = text;
  }
  if (!regex.test(userInput)) {
    return { success: false, error: "🤖\n\nDisculpa, el monto debe ser un texto solamente con números", ammount: "" };
  } else {
    return { success: true, error: "", ammount: Number(userInput) };
  }
}
