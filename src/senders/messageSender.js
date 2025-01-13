export default function messageSender(chatId, message, bot){
    try {
        bot.sendMessage(chatId, message);
    } catch (error) {
        console.log("no pudo enviarse el mensaje, intente de nuevo ", error)
    }
}