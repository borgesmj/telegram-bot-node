import { botReplies } from "../messages/botReplies.js";

export async function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { success: false, error: botReplies[7] };
  } else {
    return { success: true, error: "" };
  }
}

export async function validateText(text){
    if(!text){
        return {success: false, error: botReplies[9]};
    } else {
        return {success: true, error: ""};
    }
}