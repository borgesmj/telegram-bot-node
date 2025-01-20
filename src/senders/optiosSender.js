export default function messageWithOptions(text, chatId, bot, keyboard) {
  try {
    bot.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: keyboard,
      },
      parse_mode: "Markdown", 
    });
  } catch (error) {
    console.log("Error al enviar el mensaje con opciones: ", error);
  }
}
