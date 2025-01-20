export default function sendMenu(chatId, bot) {
  try {
    bot.sendMessage(chatId, "Menu Principal", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Nuevo Ingreso", callback_data: "new_income" }],
          [{ text: "Nuevo Retiro", callback_data: "new_withdraw" }],
          [{ text: "Nuevo Ahorro", callback_data: "new_savings" }],
          [{ text: "Ver movimientos", callback_data: "see_records" }],
          [{ text: "Ver saldos", callback_data: "see_balances" }],
          [{ text: "Mi Perfil", callback_data: "my_profile" }],
          [{ text: "Info de este bot", callback_data: "about_bot" }],
        ],
      },
    });
  } catch (error) {
    console.log("Errior al enviar el menu principal");
  }
}
