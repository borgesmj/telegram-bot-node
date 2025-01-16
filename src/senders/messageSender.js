export default function messageSender(chatId, message, bot){
    try {
        bot.sendMessage(chatId, message, {parse_mode: "markdown"});
    } catch (error) {
        console.log("no pudo enviarse el mensaje, intente de nuevo ", error)
    }
}