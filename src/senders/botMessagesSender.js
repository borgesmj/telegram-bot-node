export default class MessageSender{
    constructor(bot){
        this.chatId = null
        this.text = null
        this.bot = bot
        this.inlineKeyboard = []
        this.messageId = 0
    }

    sendTextMessage(chatId, text, inline_keyboard){
        this.text = text;
        this.inlineKeyboard = inline_keyboard
        this.bot.sendMessage(chatId, text, {
            reply_markup: {
              inline_keyboard: inline_keyboard,
            },
            parse_mode: "markdown",
          });
    }
}