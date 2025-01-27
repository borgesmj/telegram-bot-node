export default class MessageSender{
    constructor(bot){
        this.chatId = null
        this.text = null
        this.bot = bot
        this.inlineKeyboard = []
        this.messageId = 0
    }

    sendTextMessage(chatId, text, inline_keyboard){
        try {
          this.bot.sendMessage(chatId, text, {
            reply_markup: {
              inline_keyboard: inline_keyboard,
            },
            parse_mode: "markdown",
          });
        } catch (error) {
          console.log("Error enviando el mensaje: ", error)
        }
    }

    editTextMessage(chatId, text, inline_keyboard, messageId){
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
        console.log("Error editando el ultimo mensaje", error)
      }
    }
}