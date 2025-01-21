import { parse } from "dotenv";

export function optionsEdit(text, chatId, bot, keyboard, messageId) {
  try {
    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: keyboard,
      },
      parse_mode: "markdown",
    });
  } catch (error) {
    console.log("Error al enviar el mensaje con opciones: ", error);
  }
}

export function optionsSend(text, chatId, bot, keyboard){
  try {
    bot.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
      parse_mode: "markdown",
    });
  } catch (error) {
    console.log("Error al enviar el mensaje con opciones: ", error);
  }
}
