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

export function optionsSend(text, chatId, bot, keyboard) {
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

export async function sendConfirmation(text, action, bot, chatId) {
  const inline_keyboard = [
    [
      {
        text: "Confirmar",
        callback_data: action,
      },
    ],
    [
      {
        text: "Cancelar",
        callback_data: "back_to_menu_btn",
      },
    ],
  ];
  try {
    await optionsSend(text, chatId, bot, inline_keyboard)
  } catch (error) {
    console.log("Error al enviar el mensaje de confirmación ", error)
  }
}
