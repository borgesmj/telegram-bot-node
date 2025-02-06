import {
  createNewRecord,
  createNewSaving,
  createNewUser,
  editProfile,
  editUserTimeZone,
  fetchAllUserCategories,
  fetchAmmountByCategoriesandMonth,
  fetchBalanceByMonth,
  fetchCurrentUser,
  fetchInitialBalance,
  fetchSavings,
  fetchTransactionById,
  fetchTransactionsAndBalance,
  fetchTransactionsList,
  fetchUserCategories,
  fetchUsers,
  insertNewTransactionCategory,
  updateUserCategory,
} from "../database/databaseHandlers.js";
import { botReplies } from "../messages/botMessages.js";
import { adjustToLocalTime, timeZones } from "../utils/dateFormater.js";
import numberFormater from "../utils/numberFormater.js";
import getMonthString from "../utils/getMonth.js";
import { decryptText, encrypText, generateUserIV } from "../helpers/encryptText.js";
import fs from "fs";
import { botAnswers } from "../messages/help.answers.js";
import { botErrorMessages } from "../messages/botErrorMessages.js";
export default async function handleUserQueries(
  query,
  userManager,
  currentUser,
  messageSender,
  imagePath
) {
  let inline_keyboard = [];
  let newTextMessage = "";
  let messageId = query.message.message_id;
  let chatId = query.message.chat.id;
  let confirmationMessage = "";
  let confirmTransaction = null;
  let tempRow = [];
  let recordListPage = 0;
  let transactionsList = [];
  let selectedMonth = 0;
  let totalSavings = 0;
  let tempAmmount = 0;
  let editProfileStatus = null;
  let userCategories = [];
  let savingsBalance = 0;
  let expenseBalance = 0;
  let incomeBalance = 0;
  let generalBalance = 0;
  let photoSent = null;
  let filePath = "";
  let fileStream = null;
  userManager.setUserProfile(chatId, await fetchCurrentUser(chatId));
  currentUser = await userManager.getUserProfile(chatId);
  switch (query.data) {
    case "edit-first-name-btn":
      newTextMessage = botReplies[2];
      inline_keyboard = [
        [
          {
            text: "Mejor dejarlo asi",
            callback_data: "not-edit-first-name-btn",
          },
        ],
      ];
      await messageSender.editTextMessage(
        chatId,
        newTextMessage,
        inline_keyboard,
        messageId
      );
      userManager.setUserStatus(chatId, "waiting-for-new-user-name");
      return;
    case "not-edit-first-name-btn":
      newTextMessage = botReplies[8].replace(
        "$username",
        userManager.getNewUser(chatId).first_name
      );
      await messageSender.sendTextMessage(chatId, newTextMessage, []);
      await userManager.setUserStatus(chatId, "waiting-for-new-email");
      await new Promise((resolve) => setTimeout(resolve, 500));
      await messageSender.sendTextMessage(chatId, botReplies[4], []);
      return;
    case "confirm_new_profile_btn":
      if (!userManager.getUserStatus(chatId) === "waiting_for_confirmation") {
        return;
      }
      userManager.setNewUser(chatId, {
        ...userManager.getNewUser(chatId),
        created_at: new Date(query.message.date * 1000),
      });
      const newProfile = await createNewUser(
        chatId,
        userManager.getNewUser(chatId)
      );
      if (!newProfile.success) {
        await messageSender.sendTextMessage(chatId, newProfile.error, []);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await messageSender.sendTextMessage(chatId, botReplies[9], []);
      await userManager.setUserStatus(
        chatId,
        "waiting_for_new_income_categories"
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender.sendTextMessage(chatId, botReplies[11], []);
      return;
    case "start_over_new_profile_btn":
      await userManager.setUserStatus(chatId, "waiting-for-new-user-name");
      await messageSender.sendTextMessage(chatId, botReplies[22], []);
      return;
    case "set_expenses_categories_btn":
      await messageSender.sendTextMessage(chatId, botReplies[13], []);
      await userManager.setUserStatus(
        chatId,
        "waiting_for_expenses_categories"
      );
      return;
    case "end_categories_configuration_btn":
      await userManager.setUserStatus(chatId, "waiting_for_initial_balance");
      await messageSender.sendTextMessage(chatId, botReplies[14], []);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender.sendTextMessage(chatId, botReplies[15], []);
      return;
    case "reset_new_initial_balance_btn":
      await userManager.setUserStatus(chatId, "waiting_for_initial_balance");
      await messageSender.sendTextMessage(chatId, botReplies[19], []);
      return;
    case "confirm_initial_balance_btn":
      if (!userManager.getUserStatus(chatId) === "waiting_for_confirmation") {
        return;
      }
      const newInitialBalance = userManager.getUserAmmount(chatId);
      userManager.setUserTransaction(chatId, {
        ...userManager.getUserTransaction(chatId),
        ammount: newInitialBalance,
        created_at: await new Date(query.message.date * 1000),
      });

      const setInitialBalance = await createNewRecord(
        userManager.getUserTransaction(chatId)
      );
      if (!setInitialBalance.success) {
        await messageSender(msg.from.id, setInitialBalance.error, bot);
        return;
      }
      await userManager.setUserTransaction(chatId, {});
      userManager.setUserStatus(chatId, "waiting_for_initial_savings");
      await messageSender.sendTextMessage(chatId, botReplies[16], []);
      return;
    case "reset_new_initial_savings_btn":
      await userManager.setUserStatus(chatId, "waiting_for_initial_savings");
      await messageSender.sendTextMessage(chatId, botReplies[21], []);
      return;
    case "confirm_initial_savings_btn":
      userManager.setUserTransaction(chatId, {
        ...userManager.getUserTransaction(chatId),
        created_at: await new Date(query.message.date * 1000),
      });
      const { ammount, created_at, user_id } =
        userManager.getUserTransaction(chatId);
      const setInitialSavings = await createNewSaving({
        created_at: created_at,
        ammount: ammount,
        user_id: user_id,
      });
      if (!setInitialSavings.success) {
        await messageSender(msg.from.id, setInitialSavings.error, bot);
        return;
      }
      await messageSender.sendSticker(
        chatId,
        "CAACAgIAAxkBAAIHDmeOm69HfXLndfrFKBK2HSfi4zdBAAJeEgAC7JkpSXzv2aVH92Q7NgQ"
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      await messageSender.sendTextMessage(chatId, botReplies[17], []);
      await userManager.setUserStatus(chatId, "initial");
      await userManager.setUserTransaction(chatId, {});
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender.sendMenu(chatId);
      return;
    case "new_income":
      userManager.setUserTransaction(chatId, { type: "INGRESO" });
      await messageSender.editTextMessage(
        chatId,
        botReplies[23],
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );
      userManager.setUserStatus(chatId, "waiting_for_transaction_name");
      return;
    case "confirm_transaction":
      incomeBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "INGRESO"
      );
      expenseBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "EGRESO"
      );
      savingsBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "AHORROS"
      );
      generalBalance = incomeBalance - expenseBalance - savingsBalance;
      if (!userManager.getUserStatus(chatId) === "waiting_for_confirmation") {
        return;
      } else if (
        userManager.getUserTransaction(chatId).type === "EGRESO" &&
        userManager.getUserTransaction(chatId).ammount > generalBalance
      ) {
        await messageSender.sendTextMessage(chatId, botReplies[66], []);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await messageSender.sendMenu(chatId);
        return;
      }
      userManager.setUserTransaction(chatId, {
        ...userManager.getUserTransaction(chatId),
        created_at: await new Date(query.message.date * 1000),
        user_id: currentUser.id,
      });
      confirmTransaction = await createNewRecord(
        userManager.getUserTransaction(chatId)
      );
      if (!confirmTransaction.success) {
        await messageSender.sendTextMessage(
          chatId,
          confirmTransaction.error,
          []
        );
        return;
      }
      await messageSender.sendSticker(
        chatId,
        "CAACAgIAAxkBAAIEd2eY7ZpLKIwF2P1qz0kzamW4FhIqAAL-AANWnb0K2gRhMC751_82BA"
      );
      await new Promise((resolve) => setTimeout(resolve, 600));
      await messageSender.sendTextMessage(chatId, botReplies[27], []);
      await new Promise((resolve) => setTimeout(resolve, 400));
      await messageSender.sendMenu(chatId);
      userManager.setUserStatus(chatId, "initial");
      userManager.setUserTransaction(chatId, {});
      return;
    case "new_withdraw":
      userManager.setUserTransaction(chatId, { type: "EGRESO" });
      await messageSender.editTextMessage(
        chatId,
        botReplies[28],
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );
      userManager.setUserStatus(chatId, "waiting_for_transaction_name");
      return;
    case "new_savings":
      userManager.setUserTransaction(chatId, {
        type: "AHORROS",
        details: "Nuevos ahorros",
        category: "AHORROS",
      });
      inline_keyboard = [
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      await userManager.setUserStatus(chatId, "waiting_for_new_savings");
      await messageSender.editTextMessage(
        chatId,
        botReplies[29],
        inline_keyboard,
        messageId
      );
      return;
    case "confirm_new_savings_btn":
      incomeBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "INGRESO"
      );
      expenseBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "EGRESO"
      );
      savingsBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "AHORROS"
      );
      generalBalance = incomeBalance - expenseBalance - savingsBalance;
      if (!userManager.getUserStatus(chatId) === "waiting_for_confirmation") {
        return;
      } else if (
        userManager.getUserTransaction(chatId).ammount > generalBalance
      ) {
        await messageSender.sendTextMessage(chatId, botReplies[66], []);
        await messageSender.sendMenu(chatId);
        return;
      }
      userManager.setUserTransaction(chatId, {
        ...userManager.getUserTransaction(chatId),
        created_at: await new Date(query.message.date * 1000),
        user_id: currentUser.id,
      });
      confirmTransaction = await createNewRecord(
        userManager.getUserTransaction(chatId)
      );
      if (!confirmTransaction.success) {
        await messageSender.sendTextMessage(
          chatId,
          confirmTransaction.error,
          []
        );
        return;
      }
      confirmTransaction = await createNewSaving({
        ammount: userManager.getUserTransaction(chatId).ammount,
        created_at: userManager.getUserTransaction(chatId).created_at,
        user_id: currentUser.id,
      });
      if (!confirmTransaction.success) {
        await messageSender.sendTextMessage(
          chatId,
          confirmTransaction.error,
          []
        );
        return;
      }
      await messageSender.sendSticker(
        chatId,
        "CAACAgEAAxkBAAIK82eRDxisoxm1di27Ab7-ZOhMss0hAAIdAQACOA6CEeGEiSFq5-6JNgQ"
      );
      await messageSender.sendTextMessage(chatId, botReplies[31], []);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender.sendMenu(chatId);
      userManager.setUserStatus(chatId, "initial");
      userManager.setUserTransaction(chatId, {});
      return;
    case "see_records_list":
      inline_keyboard = [];
      tempRow = [];
      recordListPage = 1;
      transactionsList = await fetchTransactionsList(
        currentUser.id,
        recordListPage
      );
      newTextMessage = "";
      newTextMessage += "💸 *Tus últimos movimientos*:\n\n";
      const messages = await Promise.all(
        transactionsList.map(async (transaction, index) => {
          return `${index + 1}) ${
            transaction.record_type === "INGRESO"
              ? "🟢"
              : transaction.record_type === "EGRESO"
              ? "🔴"
              : "🔵"
          } *${transaction.detalles}* - ${await numberFormater(
            transaction.monto,
            currentUser.currency
          )}\n`;
        })
      );
      transactionsList.forEach((transaction, index) => {
        tempRow.push({
          text: `${index + 1}`,
          callback_data: `details-transaction:${transaction.id}`,
        });
        if (tempRow.length === 5 || index === transactionsList.length - 1) {
          inline_keyboard.push(tempRow);
          tempRow = [];
        }
      });
      newTextMessage = `💸 *Tus últimos movimientos*:\n\n${messages.join("")}`;
      /**
       * 
      inline_keyboard.push([
        {
          text: "⬅",
          callback_data: "previous_page_btn",
        },
        {
          text: "➡",
          callback_data: "next_page_btn",
        },
      ]);
      */
      inline_keyboard.push([
        {
          text: "Regresar",
          callback_data: "back_to_menu_btn",
        },
      ]);
      await messageSender.editTextMessage(
        chatId,
        newTextMessage,
        inline_keyboard,
        messageId
      );

      return;
    case "back_to_menu_btn":
      await messageSender.editMessageToMenu(chatId, messageId);
      return;
    case "see_balances":
      inline_keyboard = [
        [
          {
            text: "📅 Mes Actual",
            callback_data: "see_balance_current_month_btn",
          },
        ],
        [{ text: "📅 Otro mes", callback_data: "see_another_month_btn" }],
        [
          {
            text: "📊 Historial completo",
            callback_data: "see_balance_history_btn",
          },
        ],
        [{ text: "💰 Ver ahorros", callback_data: "see_total_savings_btn" }],
        [{ text: "❌ Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      messageSender.editTextMessage(
        chatId,
        "Elige una opcion:",
        inline_keyboard,
        messageId
      );
      return;
    case "see_balance_current_month_btn":
      const today = new Date();
      selectedMonth = today.getMonth();
      const incomeBalanceCurrentMonth = await fetchBalanceByMonth(
        chatId,
        selectedMonth,
        "INGRESO"
      );
      const expensesBalanceCurrentMonth = await fetchBalanceByMonth(
        chatId,
        selectedMonth,
        "EGRESO"
      );
      const savingsBalanceCurrentMonth = await fetchBalanceByMonth(
        chatId,
        selectedMonth,
        "AHORROS"
      );
      const generalBalanceCurrentMonth =
        incomeBalanceCurrentMonth -
        expensesBalanceCurrentMonth -
        savingsBalanceCurrentMonth;
      newTextMessage = botReplies[32]
        .replace(
          "$income",
          await numberFormater(incomeBalanceCurrentMonth, currentUser.currency)
        )
        .replace(
          "$expenses",
          await numberFormater(
            expensesBalanceCurrentMonth,
            currentUser.currency
          )
        )
        .replace(
          "$savings",
          await numberFormater(savingsBalanceCurrentMonth, currentUser.currency)
        )
        .replace(
          "$balance",
          await numberFormater(generalBalanceCurrentMonth, currentUser.currency)
        )
        .replace("$month", "mes actual");
      inline_keyboard = [
        [
          {
            text: "Regresar",
            callback_data: "see_balances",
          },
        ],
        [
          {
            text: "Ver detalles",
            callback_data: "see_balance_details-btn",
          },
        ],
      ];
      messageSender.editTextMessage(
        chatId,
        newTextMessage,
        inline_keyboard,
        messageId
      );
      return;
    case "see_another_month_btn":
      inline_keyboard =[]
      tempRow = []
      for (let i = 0; i < 12; i++){
        tempRow.push({text: `${await getMonthString(String(i))}`, callback_data: `balance-month-${i}`})

        if (tempRow.length === 2){
          inline_keyboard.push(tempRow)
          tempRow = []
        }
      }
        inline_keyboard.push([{ text: "Regresar", callback_data: "see_balances" }])
      await messageSender.editTextMessage(
        chatId,
        "Elige el mes",
        inline_keyboard,
        messageId
      );
      return;
    case "see_balance_history_btn":
      incomeBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "INGRESO"
      );
      expenseBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "EGRESO"
      );
      savingsBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "AHORROS"
      );
      const savingsHistoricBalance = await fetchSavings(currentUser.id);
      generalBalance = incomeBalance - expenseBalance - savingsBalance;
      newTextMessage = botReplies[34]
        .replace(
          "$income",
          await numberFormater(incomeBalance, currentUser.currency)
        )
        .replace(
          "$expenses",
          await numberFormater(expenseBalance, currentUser.currency)
        )
        .replace(
          "$savings",
          await numberFormater(savingsHistoricBalance, currentUser.currency)
        )
        .replace(
          "$balance",
          await numberFormater(generalBalance, currentUser.currency)
        );
      inline_keyboard = [[{ text: "Regresar", callback_data: "see_balances" }]];
      await messageSender.editTextMessage(
        chatId,
        newTextMessage,
        inline_keyboard,
        messageId
      );
      return;
    case "see_total_savings_btn":
      totalSavings = await fetchSavings(currentUser.id);
      newTextMessage = botReplies[35].replace(
        "$ammount",
        await numberFormater(totalSavings, currentUser.currency)
      );
      inline_keyboard = [
        [
          {
            text: "Realizar un retiro de los ahorros",
            callback_data: "savings_withdraw_btn",
          },
        ],
        [{ text: "Regresar", callback_data: "see_balances" }],
      ];
      await messageSender.editTextMessage(
        chatId,
        newTextMessage,
        inline_keyboard,
        messageId
      );
      return;
    case "see_balance_details-btn":
      newTextMessage = "";
      await messageSender.editTextMessage(
        chatId,
        "🤖\n\nDame un momento, estoy cargando la informacion....",
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );
      newTextMessage += `*Detalles de las transacciones en el mes de ${await getMonthString(
        String(selectedMonth + 1)
      )}*\n\n`;
      tempAmmount = await fetchBalanceByMonth(
        query.message.chat.id,
        selectedMonth + 1,
        "INGRESO"
      );
      let userAmmounts = {
        totalIncomes: tempAmmount,
      };
      newTextMessage += botReplies[36].replace(
        "$ammount",
        await numberFormater(tempAmmount, currentUser.currency)
      );
      tempAmmount = 0;
      newTextMessage += "\n";
      let initialBalance = await fetchInitialBalance(
        currentUser.id,
        selectedMonth + 1
      );
      if (initialBalance > 0) {
        newTextMessage += botReplies[37]
          .replace("$category", "Balance Inicial")
          .replace(
            "$ammount",
            await numberFormater(initialBalance, currentUser.currency)
          );
      }
      newTextMessage += "\n";
      const incomeCategories = await fetchAllUserCategories(
        currentUser.id,
        "INGRESO"
      );
      const expenseCategories = await fetchAllUserCategories(
        currentUser.id,
        "EGRESO"
      );
      const incomeDetails = await Promise.all(
        incomeCategories.map(async (category) => {
          tempAmmount = await fetchAmmountByCategoriesandMonth(
            currentUser.id,
            category.id,
            selectedMonth + 1
          );
          let tempMessage = botReplies[37]
            .replace("$category", category.name)
            .replace(
              "$ammount",
              await numberFormater(tempAmmount, currentUser.currency)
            );
          return tempMessage;
        })
      );
      newTextMessage += incomeDetails.join("\n");
      await messageSender.editTextMessage(
        chatId,
        "🤖\n\nSigo trabajando para extraer tu información....",
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );
      newTextMessage += "\n\n";
      tempAmmount = await fetchBalanceByMonth(
        query.message.chat.id,
        selectedMonth + 1,
        "EGRESO"
      );
      userAmmounts.expenses = tempAmmount;
      newTextMessage += botReplies[38].replace(
        "$ammount",
        await numberFormater(tempAmmount, currentUser.currency)
      );
      tempAmmount = 0;
      newTextMessage += "\n";
      const expensesDetails = await Promise.all(
        expenseCategories.map(async (category) => {
          tempAmmount = await fetchAmmountByCategoriesandMonth(
            currentUser.id,
            category.id,
            selectedMonth + 1
          );
          let tempMessage = botReplies[37]
            .replace("$category", category.name)
            .replace(
              "$ammount",
              await numberFormater(tempAmmount, currentUser.currency)
            );
          return tempMessage;
        })
      );
      newTextMessage += expensesDetails.join("\n");
      newTextMessage += "\n\n";
      tempAmmount = await fetchBalanceByMonth(
        query.message.chat.id,
        selectedMonth + 1,
        "AHORROS"
      );
      userAmmounts.savings = tempAmmount;
      newTextMessage += "\n\n";
      newTextMessage += botReplies[40].replace(
        "$ammount",
        await numberFormater(
          userAmmounts.totalIncomes -
            userAmmounts.expenses -
            userAmmounts.savings,
          currentUser.currency
        )
      );
      const percent = ((tempAmmount / userAmmounts.totalIncomes) * 100).toFixed(
        2
      );
      newTextMessage += botReplies[39]
        .replace(
          "$ammount",
          await numberFormater(tempAmmount, currentUser.currency)
        )
        .replace("$percent", percent);
      if (percent >= 15) {
        newTextMessage += botReplies[41];
      } else if (percent > 7 && percent < 15) {
        newTextMessage += botReplies[42];
      } else if (percent <= 7 && percent > 1) {
        newTextMessage += botReplies[43];
      } else {
        newTextMessage += botReplies[44];
      }
      inline_keyboard = [
        [{ text: "Regresar", callback_data: "back_to_menu_btn" }],
      ];
      messageSender.editTextMessage(
        chatId,
        newTextMessage,
        inline_keyboard,
        messageId
      );
      return;
    case "my_profile":
      const { first_name, last_name, email, telegram_username, currency } =
        currentUser;
      inline_keyboard = [
        [
          {
            text: "✏️ Editar",
            callback_data: "edit_profile",
          },
        ],
        [
          {
            text: "🔙 Regresar al menú principal",
            callback_data: "back_to_menu_btn",
          },
        ],
      ];
      const decriptedProfile = {
        dec_first_name: decryptText(first_name),
        dec_last_name: decryptText(last_name),
        dec_email: decryptText(email),
        dec_telegram_username: decryptText(telegram_username),
      };
      const {
        dec_first_name,
        dec_last_name,
        dec_email,
        dec_telegram_username,
      } = decriptedProfile;
      newTextMessage = botReplies[45]
        .replace("$userFirstName", dec_first_name || "")
        .replace("$userLastName", dec_last_name || "")
        .replace("$userEmail", dec_email)
        .replace("$username", dec_telegram_username)
        .replace("$userCurrency", currentUser.currency)
        .replace(
          "$tier",
          currentUser.subscriptionLevel === "free"
            ? "🆓 Gratuito"
            : currentUser.subscriptionLevel === "tier1"
            ? "⭐ Estandar"
            : "💎 Premium"
        );
      messageSender.editTextMessage(
        chatId,
        newTextMessage,
        inline_keyboard,
        messageId
      );
      return;
    case "edit_profile":
      inline_keyboard = [
        [
          {
            text: "Nombre",
            callback_data: "edit_firstname_btn",
          },
          {
            text: "Apellido",
            callback_data: "edit_lastname_btn",
          },
        ],
        [
          {
            text: "Email",
            callback_data: "edit_email_btn",
          },
          {
            text: "Categorías",
            callback_data: "edit_categories_btn",
          },
        ],
        [
          {
            text: "Actualizar username",
            callback_data: "edit_username_btn",
          },
          {
            text: "Zona horaria",
            callback_data: "change_time_zome_btn",
          },
        ],
        [{ text: "🆙 Actualizar plan", callback_data: "upgrade_plan_btn" }],
        [
          {
            text: "⏪ Regresar a mi perfil",
            callback_data: "my_profile",
          },
        ],
      ];
      await messageSender.editTextMessage(
        chatId,
        "*Elige la opción que desees editar:*",
        inline_keyboard,
        messageId
      );
      return;
    case "edit_firstname_btn":
      await userManager.setUserStatus(chatId, "waiting_for_new_profile_data");
      await userManager.setEditProfile(chatId, { category: "first_name" });
      await messageSender.editTextMessage(
        chatId,
        "Enviame el nuevo nombre como quieres que te llame",
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );
      return;
    case "edit_lastname_btn":
      await userManager.setUserStatus(chatId, "waiting_for_new_profile_data");
      await userManager.setEditProfile(chatId, { category: "last_name" });
      await messageSender.editTextMessage(
        chatId,
        "Enviame el nuevo apellido como quieres que te llame",
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );
      return;
    case "edit_email_btn":
      await userManager.setUserStatus(chatId, "waiting_for_new_profile_data");
      await userManager.setEditProfile(chatId, { category: "email" });
      await messageSender.editTextMessage(
        chatId,
        "Enviame el nuevo correo electronico que quieres que tenga",
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );
      return;
    case "edit_username_btn":
      await userManager.setEditProfile(chatId, {
        category: "telegram_username",
        value: await encrypText(query.from.username, currentUser.user_iv),
      });

      editProfileStatus = await editProfile(
        userManager.getEditProfile(chatId),
        currentUser.id
      );
      if (!editProfileStatus.success) {
        await messageSender.sendTextMessage(
          chatId,
          editProfileStatus.error,
          []
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      await messageSender.sendTextMessage(chatId, botReplies[48], []);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await messageSender.sendMenu(chatId);
      return;
    case "confirm_new_profile_data_btn":
      if (!userManager.getUserStatus(chatId) === "waiting_for_confirmation") {
        return;
      }
      const newValue = await encrypText(
        await userManager.getEditProfile(chatId).value,
        currentUser.user_iv
      );
      await userManager.setEditProfile(chatId, {
        ...userManager.getEditProfile(chatId),
        value: newValue,
      });
      editProfileStatus = await editProfile(
        userManager.getEditProfile(chatId),
        currentUser.id
      );
      if (!editProfileStatus.success) {
        await messageSender.sendTextMessage(
          chatId,
          editProfileStatus.error,
          []
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      await messageSender.sendTextMessage(chatId, botReplies[47], []);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await messageSender.sendMenu(chatId);
      return;
    case "edit_categories_btn":
      inline_keyboard = [
        [
          {
            text: "Editar",
            callback_data: "edit_exist_category_btn",
          },
          { text: "Agregar", callback_data: "add_new_category_btn" },
        ],
        [{ text: "Regresar", callback_data: "back_to_menu_btn" }],
      ];
      await messageSender.editTextMessage(
        chatId,
        botReplies[49],
        inline_keyboard,
        messageId
      );
      return;
    case "edit_exist_category_btn":
      inline_keyboard = [
        [
          { text: "Ingreso", callback_data: "edit_income_categories_btn" },
          { text: "Egreso", callback_data: "edit_expenses_categories_btn" },
        ],
        [{ text: "cancelar", callback_data: "back_to_menu_btn" }],
      ];
      await messageSender.editTextMessage(
        chatId,
        botReplies[50],
        inline_keyboard,
        messageId
      );
      return;
    case "edit_income_categories_btn":
      inline_keyboard = [];
      tempRow = [];
      userCategories = await fetchUserCategories(
        query.message.chat.id,
        "INGRESO"
      );
      userCategories.forEach((category, index) => {
        tempRow.push({
          text: category.name,
          callback_data: `category-edit-selection-option:${category.name}`,
        });
        if (tempRow.length === 2 || index === userCategories.length - 1) {
          inline_keyboard.push(tempRow);
          tempRow = [];
        }
      });
      inline_keyboard.push([
        {
          text: "Cancelar",
          callback_data: "back_to_menu_btn",
        },
      ]);
      await messageSender.editTextMessage(
        chatId,
        botReplies[51],
        inline_keyboard,
        messageId
      );
      return;
    case "edit_expenses_categories_btn":
      inline_keyboard = [];
      tempRow = [];
      userCategories = await fetchUserCategories(
        query.message.chat.id,
        "EGRESO"
      );
      userCategories.forEach((category, index) => {
        tempRow.push({
          text: category.name,
          callback_data: `category-edit-selection-option:${category.name}`,
        });
        if (tempRow.length === 2 || index === userCategories.length - 1) {
          inline_keyboard.push(tempRow);
          tempRow = [];
        }
      });
      inline_keyboard.push([
        {
          text: "Cancelar",
          callback_data: "back_to_menu_btn",
        },
      ]);
      await messageSender.editTextMessage(
        chatId,
        botReplies[51],
        inline_keyboard,
        messageId
      );
      return;
    case "confirm_category_edit_btn":
      editProfileStatus = await updateUserCategory(
        userManager.getEditProfile(chatId)
      );
      if (!editProfileStatus.success) {
        await messageSender.sendTextMessage(
          chatId,
          editProfileStatus.error,
          []
        );
        return;
      }
      await messageSender.sendTextMessage(chatId, botReplies[54], []);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await userManager.setEditProfile(chatId, {});
      await messageSender.sendMenu(chatId);
      return;
    case "add_new_category_btn":
      inline_keyboard = [
        [
          { text: "Ingreso", callback_data: "add_new_income_category_btn" },
          { text: "Egreso", callback_data: "add_new_expense_category_btn" },
        ],
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      await messageSender.editTextMessage(
        chatId,
        botReplies[55],
        inline_keyboard,
        messageId
      );
      return;
    case "add_new_income_category_btn":
      userManager.setEditProfile(chatId, {
        type: "INGRESO",
        user_id: currentUser.id,
      });
      inline_keyboard = [
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      await messageSender.editTextMessage(
        chatId,
        botReplies[56],
        inline_keyboard,
        messageId
      );
      await userManager.setUserStatus(chatId, "waiting_for_new_category");
      return;
    case "add_new_expense_category_btn":
      userManager.setEditProfile(chatId, {
        type: "EGRESO",
        user_id: currentUser.id,
      });
      inline_keyboard = [
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      await messageSender.editTextMessage(
        chatId,
        botReplies[56],
        inline_keyboard,
        messageId
      );
      await userManager.setUserStatus(chatId, "waiting_for_new_category");
      return;
    case "confirm_add_new_category_btn":
      if (!userManager.getUserStatus(chatId) === "waiting_for_confirmation") {
        return;
      }
      const addNewCategory = await insertNewTransactionCategory(
        userManager.getEditProfile(chatId)
      );
      if (!addNewCategory.success) {
        await messageSender(query.message.chat.id, addNewCategory.error, bot);
      }
      await messageSender.sendTextMessage(
        chatId,
        botReplies[58].replace(
          "$category",
          userManager.getEditProfile(chatId).name
        ),
        []
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
      await userManager.setEditProfile(chatId, {});
      await messageSender.sendMenu(chatId);
      return;
    case "upgrade_plan_btn":
      await messageSender.editTextMessage(
        chatId,
        "🌟 Para poder seguir mejorando y actualizar tu plan, agradeceríamos mucho un aporte voluntario que nos ayude a continuar con el proyecto. ¡Tu apoyo es fundamental! 🙏",
        [
          [
            {
              text: "Quiero apoyar el proyecto 💖",
              callback_data: "donate_btn",
            },
          ],
          [
            {
              text: "Ver beneficios 🎁",
              url: "https://telegram-bot-node-cee9.onrender.com/planes",
            },
          ],
          [{ text: "Regresar al menú 🔙", callback_data: "back_to_menu_btn" }],
        ],
        messageId
      );
      return;
    case "about_bot":
      await messageSender.sendTextMessage(chatId, botReplies[60], []);
      await new Promise((resolve) => setTimeout(resolve, 200));
      await messageSender.sendTextMessage(chatId, botReplies[61], [
        [
          {
            text: "Mi pagina web con mas información",
            url: "https://telegram-bot-node-cee9.onrender.com/",
          },
        ],
        [
          {
            text: "Repositorio de github del proyecto",
            url: "https://github.com/borgesmj/telegram-bot-node",
          },
        ],
        [
          {
            text: "Página web de Miguel",
            url: "https://borgesmj.github.io/",
          },
        ],
        [
          {
            text: "Quiero apoyar el proyecto 💖",
            callback_data: "donate_btn",
          },
        ],
        [
          {
            text: "Regresar al menú principal",
            callback_data: "back_to_menu_btn",
          },
        ],
      ]);
      return;
    case "savings_withdraw_btn":
      messageSender.editTextMessage(
        chatId,
        botReplies[62],
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );
      userManager.setUserStatus(chatId, "waiting_for_new_savings_withdraw");
      return;
    case "confirm_new_savings_withdraw_btn":
      const savingsTotalAmmount = await fetchSavings(currentUser.id);
      if (
        savingsTotalAmmount <
        Math.abs(userManager.getUserTransaction(chatId).ammount)
      ) {
        await messageSender.sendTextMessage(chatId, botReplies[67], []);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await messageSender.sendMenu(chatId);
        return;
      }
      userManager.setUserTransaction(chatId, {
        ...userManager.getUserTransaction(chatId),
        created_at: await new Date(query.message.date * 1000),
      });
      confirmTransaction = await createNewSaving(
        userManager.getUserTransaction(chatId)
      );
      if (!confirmTransaction.success) {
        await messageSender.sendTextMessage(
          chatId,
          confirmTransaction.error,
          []
        );
        return;
      }
      await messageSender.sendTextMessage(
        chatId,
        "Transaccion exitosa. Disfruta de tus ahorros",
        []
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
      await userManager.setUserTransaction(chatId, {});
      await messageSender.sendMenu(chatId);
      return;
    case "donate_btn":
      inline_keyboard = [
        [
          {
            text: "Nequi (solo en Colombia 🇨🇴)",
            callback_data: "donate_nequi_btn",
          },
        ],
        [
          {
            text: "Binance",
            callback_data: "donate_binance_btn",
          },
        ],
        [{ text: "Regresar", callback_data: "back_to_menu_btn" }],
      ];
      await messageSender.editTextMessage(
        chatId,
        botReplies[64],
        inline_keyboard,
        messageId
      );
      return;
    case "change_time_zome_btn":
      tempRow = [];
      inline_keyboard = [];
      timeZones.forEach((timezone, index) => {
        let optionText = timezone
          .split("/")
          [timezone.split("/").length - 1].replace("_", " ");
        if (currentUser.timezone === timezone) {
          optionText = `✅ ${optionText}`;
        }
        tempRow.push({
          text: optionText,
          callback_data: `change_time_zone_to_:${timezone}`,
        });

        if (tempRow.length === 2 || index == timeZones.length - 1) {
          inline_keyboard.push(tempRow);
          tempRow = [];
        }
      });
      inline_keyboard.push([{ text: "Cancelar", callback_data: "my_profile" }]);
      newTextMessage = botReplies[65].replace(
        "$timezone",
        currentUser.timezone
      );
      messageSender.editTextMessage(
        chatId,
        newTextMessage,
        inline_keyboard,
        messageId
      );
      return;
    case "go_to_admin_menu":
      inline_keyboard = [
        [{ text: "Conteo de usuarios", callback_data: "count_users_btn" }],
        [{ text: "salir", callback_data: "back_to_menu_btn" }],
      ];
      await messageSender.editTextMessage(
        chatId,
        "admin menu",
        inline_keyboard,
        messageId
      );
      return;
    case "count_users_btn":
      let allUsers = await fetchUsers();
      await messageSender.sendTextMessage(
        chatId,
        `Hasta ahora hay un total de ${
          allUsers.length - 1
        } usuarios registrados`
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender.sendMenu(chatId, currentUser.ROLE);
      return;
    case "donate_nequi_btn":
      filePath = `${imagePath}/nequi.jpg`;
      fileStream = fs.createReadStream(filePath);
      photoSent = await messageSender.sendPhoto(
        chatId,
        fileStream,
        botReplies[68]
      );
      if (!photoSent.success) {
        await messageSender.sendTextMessage(chatId, photoSent.error, []);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return;
    case "donate_binance_btn":
      filePath = `${imagePath}/binance.jpg`;
      fileStream = fs.createReadStream(filePath);
      photoSent = await messageSender.sendPhoto(
        chatId,
        fileStream,
        botReplies[68]
      );
      if (!photoSent.success) {
        await messageSender.sendTextMessage(chatId, photoSent.error, []);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return;
    case "delete_picture_btn":
      await messageSender.deleteMessage(chatId, messageId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await messageSender.sendMenu(chatId);
      return;
    case "accept-terms-and-conditions-btn":
      if (!query.from.username) {
        await messageSender.sendTextMessage(chatId, botErrorMessages[2], []);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await messageSender.sendTextMessage(
          chatId,
          "Si necesitas mas información, utiliza el comando /ayuda",
          []
        );
        return;
      } else {
        const newUserProfile = {};
        userManager.setUserStatus(chatId, "initial");
        newUserProfile.telegram_id = chatId;
        newUserProfile.first_name = query.from.first_name;
        newUserProfile.last_name = query.from.last_name;
        newUserProfile.telegram_username = query.from.username;
        newUserProfile.user_iv = await generateUserIV();
        userManager.setNewUser(chatId, newUserProfile);
        await messageSender.sendTextMessage(chatId, botReplies[0], []);
        await new Promise((resolve) => setTimeout(resolve, 200));
        inline_keyboard = [
          [
            {
              text: "Esta bien asi",
              callback_data: "not-edit-first-name-btn",
            },
            { text: "Cambiarlo", callback_data: "edit-first-name-btn" },
          ],
        ];
        newTextMessage = botReplies[1].replace(
          "$username",
          query.from.first_name
        );
        await messageSender.sendTextMessage(
          chatId,
          newTextMessage,
          inline_keyboard
        );
        userManager.setUserStatus(chatId, "initial");
      }
      return;
    default:
      console.log(query.data);
      if (query.data.startsWith("category-selection-option")) {
        userManager.setUserTransaction(chatId, {
          ...userManager.getUserTransaction(chatId),
          category: query.data.split(":")[1],
        });
        const { type, details, ammount, category } =
          userManager.getUserTransaction(chatId);
        confirmationMessage = botReplies[26]
          .replace("$type", type)
          .replace("$details", details)
          .replace(
            "$ammount",
            `${await numberFormater(ammount, currentUser.currency)}`
          )
          .replace("$category", category);
        userManager.setUserStatus(chatId, "waiting_for_confirmation");
        inline_keyboard = [
          [{ text: "Confirmar", callback_data: "confirm_transaction" }],
          [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
        ];
        await messageSender.editTextMessage(
          chatId,
          confirmationMessage,
          inline_keyboard,
          messageId
        );
      } else if (query.data.startsWith("balance-month-")) {
        selectedMonth = query.data.split("-")[2];
        const incomeBalanceByMonth = await fetchBalanceByMonth(
          chatId,
          selectedMonth,
          "INGRESO"
        );
        const expensesBalanceByMonth = await fetchBalanceByMonth(
          chatId,
          selectedMonth,
          "EGRESO"
        );
        const savingsBalanceByMonth = await fetchBalanceByMonth(
          chatId,
          selectedMonth,
          "AHORROS"
        );
        const generalBalanceByMonth =
          incomeBalanceByMonth - expensesBalanceByMonth - savingsBalanceByMonth;
        if (
          incomeBalanceByMonth === 0 &&
          expensesBalanceByMonth === 0 &&
          savingsBalanceByMonth === 0
        ) {
          newTextMessage = botReplies[33]
            .replace("$month", ` ${await getMonthString(selectedMonth)}`)
            .replace("$currentYear", new Date().getFullYear());
          inline_keyboard = [
            [{ text: "Regresar", callback_data: "see_balances" }],
          ];
          messageSender.editTextMessage(
            chatId,
            newTextMessage,
            inline_keyboard,
            messageId
          );
        } else {
          newTextMessage = botReplies[32]
            .replace("$month", ` de ${await getMonthString(selectedMonth)}`)
            .replace(
              "$income",
              await numberFormater(incomeBalanceByMonth, currentUser.currency)
            )
            .replace(
              "$expenses",
              await numberFormater(expensesBalanceByMonth, currentUser.currency)
            )
            .replace(
              "$savings",
              await numberFormater(savingsBalanceByMonth, currentUser.currency)
            )
            .replace(
              "$balance",
              await numberFormater(generalBalanceByMonth, currentUser.currency)
            );
          inline_keyboard = [
            [{ text: "Regresar", callback_data: "see_balances" }],
            [
              {
                text: "Ver detalles",
                callback_data: "see_balance_details-btn",
              },
            ],
          ];
          messageSender.editTextMessage(
            chatId,
            newTextMessage,
            inline_keyboard,
            messageId
          );
        }
        /**
         */
      } else if (query.data.startsWith("category-edit-selection-option")) {
        let categoryName = query.data.split(":")[1];
        inline_keyboard = [
          [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
        ];
        await userManager.setUserStatus(chatId, "waiting_for_category_edit");
        await messageSender.editTextMessage(
          chatId,
          botReplies[52].replace("$category", categoryName),
          inline_keyboard,
          messageId
        );
        await userManager.setEditProfile(chatId, {
          oldName: categoryName,
          user_id: currentUser.id,
        });
        return;
      } else if (query.data.startsWith("details-transaction")) {
        const transactionId = query.data.split(":")[1];
        const transactionDetails = await fetchTransactionById(transactionId);
        if (!transactionDetails) {
          await messageSender(
            query.message.chat.id,
            "Lo siento, no pude encontrar ese movimiento, trata de consultar con soporte",
            bot
          );
        }
        const { record_type, detalles, monto, categories, created_at } =
          transactionDetails[0];
        const options = {
          dateStyle: "long",
          timeStyle: "short",
          timeZone: currentUser.timezone,
          hour12: true,
        };
        const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", options);
        const formatDate = await dateTimeFormatter.format(new Date(created_at));
        newTextMessage = botReplies[59]
          .replace("$details", detalles || "Sin detalles")
          .replace("$category", categories?.name || "Sin categoría")
          .replace("$type", record_type || "Sin Tipo de movimiento")
          .replace(
            "$ammount",
            await numberFormater(monto, currentUser.currency || "0")
          )
          .replace("$date", formatDate || "Sin fecha");
        inline_keyboard = [
          [{ text: "Regresar", callback_data: "see_records_list" }],
        ];
        await messageSender.editTextMessage(
          chatId,
          newTextMessage,
          inline_keyboard,
          messageId
        );
      } else if (query.data.startsWith("change_time_zone_to_:")) {
        const changeTimeZone = await editUserTimeZone(
          currentUser.id,
          query.data.split(":")[1]
        );
        if (!changeTimeZone.success) {
          await messageSender.sendTextMessage(chatId, changeTimeZone.error, []);
          messageSender.sendMenu(chatId);
          return;
        }
        messageSender.sendTextMessage(
          chatId,
          "Zona horaria cambiada con exito",
          []
        );
        messageSender.sendMenu(chatId);
      } else if (query.data.startsWith("question-help-")) {
        let answerIndex = query.data.split(":")[1];
        newTextMessage = botAnswers[answerIndex];
        messageSender.editTextMessage(chatId, newTextMessage, [], messageId);
        await new Promise((resolve) => setTimeout(resolve, 600));
        newTextMessage =
          "Para regresar o salir, selecciona el comando acorde a tu necesidad en el boton azul *menu* aqui debajo";
        await messageSender.sendTextMessage(chatId, newTextMessage, []);
        return;
      }
      return;
  }
}
