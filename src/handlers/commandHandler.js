import { botReplies } from "../messages/replies.js"
import messageSender from "../senders/messageSender.js"
export default function commandHandler(command, bot, msg){
    const chatId = msg.chat.id;
    switch (command) {
        case "start":
            const newMessage = botReplies[0].replace("%username", msg.from.first_name);
            messageSender(chatId, newMessage, bot);
            break;
        default:
            break;
    }
}