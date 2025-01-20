import messageSender from "../senders/messageSender.js";

export async function handleUserQueries(query, bot) {
  switch (query.data) {
    case "my_profile":
      messageSender(query.message.chat.id, "profile", bot);
      break;

    default:
      break;
  }
  console.log(query.data);
}
