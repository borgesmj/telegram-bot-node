export default class MessageSender {
  constructor(bot) {
    this.chatId = null;
    this.text = null;
    this.bot = bot;
    this.inlineKeyboard = [];
    this.messageId = 0;
  }

  sendTextMessage(chatId, text, inline_keyboard) {
    try {
      this.bot.sendMessage(chatId, text, {
        reply_markup: {
          inline_keyboard: inline_keyboard,
        },
        parse_mode: "markdown",
      });
    } catch (error) {
      console.log("Error enviando el mensaje: ", error);
    }
  }

  editTextMessage(chatId, text, inline_keyboard, messageId) {
    try {
      this.bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: inline_keyboard,
        },
        parse_mode: "markdown",
      });
    } catch (error) {
      console.log("Error editando el ultimo mensaje", error);
    }
  }

  sendMenu(chatId) {
    try {
      this.bot.sendMessage(chatId, "*Menu Principal* 📋", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💰 Nuevo Ingreso", callback_data: "new_income" }],
            [{ text: "💸 Nuevo Retiro", callback_data: "new_withdraw" }],
            [{ text: "💵 Nuevo Ahorro", callback_data: "new_savings" }],
            [{ text: "📋 Ver movimientos", callback_data: "see_records_list" }],
            [{ text: "📊 Ver saldos", callback_data: "see_balances" }],
            [{ text: "👤 Mi Perfil", callback_data: "my_profile" }],
            [{ text: "ℹ️ Info de este bot", callback_data: "about_bot" }],
          ],
        },
        parse_mode: "Markdown",
      });
    } catch (error) {
      console.log("Error al enviar el menu principal: ", error);
    }
  }

  sendSticker(chatId, sticker_id) {
    try {
      this.bot.sendSticker(chatId, sticker_id);
    } catch (error) {
      console.log("No pudo enviarse el sticker, intente de nuevo: ", error);
    }
  }
  editMessageToMenu(chatId, messageId) {
    try {
      this.bot.editMessageText("*Menu Principal* 📋", {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [
            [{ text: "💰 Nuevo Ingreso", callback_data: "new_income" }],
            [{ text: "💸 Nuevo Retiro", callback_data: "new_withdraw" }],
            [{ text: "💵 Nuevo Ahorro", callback_data: "new_savings" }],
            [{ text: "📋 Ver movimientos", callback_data: "see_records_list" }],
            [{ text: "📊 Ver saldos", callback_data: "see_balances" }],
            [{ text: "👤 Mi Perfil", callback_data: "my_profile" }],
            [{ text: "ℹ️ Info de este bot", callback_data: "about_bot" }],
          ],
        },
        parse_mode: "markdown",
      });
    } catch (error) {}
  }
}
