export default function sendSticker(bot, chatId, sticker_id){
    try {
        bot.sendSticker(chatId, sticker_id);
    } catch (error) {
        console.log("No pudo enviarse el sticker, intente de nuevo: ", error);
    }
}