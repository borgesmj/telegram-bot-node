import {
  createNewRecord,
  createNewSaving,
  fetchBalanceByMonth,
  fetchCurrentUser,
  fetchTransactionsAndBalance,
  fetchUserCategories,
  insertNewTransactionCategory,
  updateUserCategory,
} from "../database/databaseHandlers.js";
import { decryptText } from "../helpers/encryptText.js";
import { botReplies } from "../messages/botReplies.js";
import sendMenu from "../senders/menuSender.js";
import messageSender from "../senders/messageSender.js";
import {
  optionsEdit,
  optionsSend,
  sendConfirmation,
} from "../senders/optionsSender.js";
import sendSticker from "../senders/stickerSender.js";
import capitalizeWords from "../utils/capitalizeWords.js";
import getMonthString from "../utils/getMonth.js";
import numberFormater from "../utils/numberFormater.js";

export async function handleUserQueries(
  query,
  bot,
  userStates,
  editProfileObject,
  STATES,
  newUserRecord,
  currentUser,
  newUserCategory,
  editCategoryObject
) {
  let inline_keyboard = [];
  let chatId = query.message.chat.id;
  let messageId = query.message.message_id;
  let confirmationMessage = "";
  let textMesssage = "";
  let selectedMonth = 0;
  let tempRow = [];
  let userCategories = []
  //const currentUser = await fetchCurrentUser(query.message.chat.id);
  switch (query.data) {
    case "my_profile":
      const { first_name, last_name, email, telegram_username, currency } =
        currentUser;
      inline_keyboard = [
        [
          {
            text: "Editar Perfil",
            callback_data: "edit_profile",
          },
        ],
        [
          {
            text: "⏪ Regresar al menú principal",
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
      optionsEdit(
        botReplies[18]
          .replace(
            "$userFirstName",
            (await capitalizeWords(dec_first_name)) || ""
          )
          .replace(
            "$userLastName",
            (await capitalizeWords(dec_last_name)) || ""
          )
          .replace("$userEmail ", dec_email || "")
          .replace("$username", `@${dec_telegram_username}` || "")
          .replace("$userCurrency", currency || ""),
        chatId,
        bot,
        inline_keyboard,
        messageId
      );
      return;
    case "back_to_menu_btn":
      (inline_keyboard = [
        [{ text: "💰 Nuevo Ingreso", callback_data: "new_income" }],
        [{ text: "💸 Nuevo Retiro", callback_data: "new_withdraw" }],
        [{ text: "💵 Nuevo Ahorro", callback_data: "new_savings" }],
        [{ text: "📋 Ver movimientos", callback_data: "see_records" }],
        [{ text: "📊 Ver saldos", callback_data: "see_balances" }],
        [{ text: "👤 Mi Perfil", callback_data: "my_profile" }],
        [{ text: "ℹ️ Info de este bot", callback_data: "about_bot" }],
      ]),
        await optionsEdit(
          "*Menu Principal* 📋",
          chatId,
          bot,
          inline_keyboard,
          messageId
        );
      return;
    case "edit_profile":
      inline_keyboard = [
        [
          {
            text: "Nombre",
            callback_data: "edit_name_btn",
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
        ],
        [
          {
            text: "Editar categorias",
            callback_data: "edit_categories_btn",
          },
        ],
        [
          {
            text: "⏪ Regresar a mi perfil",
            callback_data: "my_profile",
          },
        ],
      ];
      await optionsEdit(
        "¿Que deseas editar?",
        chatId,
        bot,
        inline_keyboard,
        messageId
      );
      return;
    case "edit_name_btn":
      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_EDIT_PROFILE,
      };
      editProfileObject.category = "first_name";
      await optionsEdit(
        "Ingresa tu nuevo nombre:",
        chatId,
        bot,
        [
          [
            {
              text: "Cancelar",
              callback_data: "edit_profile",
            },
          ],
        ],
        messageId
      );
      return;
    case "edit_lastname_btn":
      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_EDIT_PROFILE,
      };
      editProfileObject.category = "last_name";
      await optionsEdit(
        "Ingresa tu nuevo apellido:",
        chatId,
        bot,
        [
          [
            {
              text: "Cancelar",
              callback_data: "edit_profile",
            },
          ],
        ],
        messageId
      );
      return;
    case "edit_email_btn":
      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_EDIT_PROFILE,
      };
      editProfileObject.category = "email";
      await optionsEdit(
        "Ingresa tu nuevo email:",
        chatId,
        bot,
        [
          [
            {
              text: "Cancelar",
              callback_data: "edit_profile",
            },
          ],
        ],
        messageId
      );
      return;
    case "new_income":
      newUserRecord.type = "INGRESO";
      await optionsEdit(
        botReplies[22],
        query.message.chat.id,
        bot,
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );

      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_TRANSACTION_NAME,
      };
      return;
    case "new_withdraw":
      newUserRecord.type = "EGRESO";
      await optionsEdit(
        botReplies[24],
        query.message.chat.id,
        bot,
        [[{ text: "Cancelar", callback_data: "back_to_menu_btn" }]],
        messageId
      );

      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_TRANSACTION_NAME,
      };
      return;
    case "confirm_transaction":
      if (userStates[query.message.chat.id] !== "waiting_for_confirmation") {
        return;
      }
      const sendNewTransaction = await createNewRecord(newUserRecord);
      if (!sendNewTransaction.success) {
        await messageSender(
          query.message.chat.id,
          sendNewTransaction.error,
          bot
        );
        return;
      }
      newUserRecord = {};
      await sendSticker(
        bot,
        query.message.chat.id,
        "CAACAgIAAxkBAAIKrGeRBX-8sa-q0WyXSKJDdRKDRiIGAAL-AANWnb0K2gRhMC751_82BA"
      );
      await new Promise((resolve) => setTimeout(resolve, 300));
      await messageSender(query.message.chat.id, "Transaccion guardadda", bot);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await sendMenu(query.message.chat.id, bot);
      userStates[query.message.chat.id] = { state: STATES.COMPLETED };
      break;
    case "new_savings":
      newUserRecord.type = "AHORROS";
      newUserRecord.details = "Nuevos ahorros";
      newUserRecord.user_id = currentUser.id;
      inline_keyboard = [
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_NEW_SAVINGS,
      };
      await optionsEdit(
        botReplies[27],
        query.message.chat.id,
        bot,
        inline_keyboard,
        messageId
      );
      return;
    case "confirm_new_savings_btn":
      if (userStates[query.message.chat.id] !== "waiting_for_confirmation") {
        return;
      }
      const saveNewSavingTable = await createNewSaving(newUserRecord);
      const saveNewSavingsRecord = await createNewRecord(newUserRecord);
      if (!saveNewSavingTable.success || !saveNewSavingsRecord.success) {
        await messageSender(
          query.message.chat.id,
          saveNewSavingTable.error,
          bot
        );
        return;
      }
      await sendSticker(
        bot,
        query.message.chat.id,
        "CAACAgEAAxkBAAIK82eRDxisoxm1di27Ab7-ZOhMss0hAAIdAQACOA6CEeGEiSFq5-6JNgQ"
      );
      await messageSender(query.message.chat.id, botReplies[28], bot);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await sendMenu(query.message.chat.id, bot);
      userStates[query.message.chat.id] = { state: STATES.COMPLETED };
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
        [{ text: "❌ Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      optionsEdit(
        "Elige una opcion",
        query.message.chat.id,
        bot,
        inline_keyboard,
        messageId
      );
      return;
    case "see_balance_history_btn":
      const incomeBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "INGRESO"
      );
      const expenseBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "EGRESO"
      );
      const savingsBalance = await fetchTransactionsAndBalance(
        currentUser.id,
        "AHORROS"
      );
      const generalBalance = incomeBalance - expenseBalance - savingsBalance;
      textMesssage = botReplies[30]
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
          await numberFormater(savingsBalance, currentUser.currency)
        )
        .replace(
          "$balance",
          await numberFormater(generalBalance, currentUser.currency)
        );
      inline_keyboard = [
        [{ text: "Regresar", callback_data: "back_to_menu_btn" }],
      ];
      await optionsEdit(
        textMesssage,
        query.message.chat.id,
        bot,
        inline_keyboard,
        messageId
      );
      return;
    case "see_balance_current_month_btn":
      const today = new Date();
      selectedMonth = today.getMonth() + 1;
      const incomeBalanceCurrentMonth = await fetchBalanceByMonth(
        query.message.chat.id,
        selectedMonth,
        "INGRESO"
      );
      const expensesBalanceCurrentMonth = await fetchBalanceByMonth(
        query.message.chat.id,
        selectedMonth,
        "EGRESO"
      );
      const savingsBalanceCurrentMonth = await fetchBalanceByMonth(
        query.message.chat.id,
        selectedMonth,
        "AHORROS"
      );
      const generalBalanceCurrentMonth =
        incomeBalanceCurrentMonth -
        expensesBalanceCurrentMonth -
        savingsBalanceCurrentMonth;
      textMesssage = botReplies[31]
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
        );
      inline_keyboard = [
        [
          {
            text: "Regresar",
            callback_data: "back_to_menu_btn",
          },
        ],
        [
          {
            text: "Ver detalles",
            callback_data: "see_balance-current-month-details-btn",
          },
        ],
      ];
      await optionsEdit(
        textMesssage,
        query.message.chat.id,
        bot,
        inline_keyboard,
        messageId
      );
      return;
    case "see_another_month_btn":
      inline_keyboard = [
        [
          {
            text: "Enero",
            callback_data: "balance-month-1",
          },
          {
            text: "Febrero",
            callback_data: "balance-month-2",
          },
        ],
        [
          {
            text: "Marzo",
            callback_data: "balance-month-3",
          },
          {
            text: "Abril",
            callback_data: "balance-month-4",
          },
        ],
        [
          {
            text: "Mayo",
            callback_data: "balance-month-5",
          },
          {
            text: "Junio",
            callback_data: "balance-month-6",
          },
        ],
        [
          {
            text: "Julio",
            callback_data: "balance-month-7",
          },
          {
            text: "Agosto",
            callback_data: "balance-month-8",
          },
        ],
        [
          {
            text: "Septiembre",
            callback_data: "balance-month-9",
          },
          {
            text: "Octubre",
            callback_data: "balance-month-10",
          },
        ],
        [
          {
            text: "Noviembre",
            callback_data: "balance-month-11",
          },
          { text: "Diciembre", callback_data: "balance-month-12" },
        ],
        [{ text: "Regresar", callback_data: "back_to_menu_btn" }],
      ];
      await optionsEdit(
        "Elige el mes",
        query.message.chat.id,
        bot,
        inline_keyboard,
        messageId
      );
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
      await optionsEdit(
        botReplies[35],
        query.message.chat.id,
        bot,
        inline_keyboard,
        messageId
      );
      return;
    case "add_new_category_btn":
      inline_keyboard = [
        [
          { text: "Ingreso", callback_data: "add_new_income_category_btn" },
          { text: "Egreso", callback_data: "add_new_expense_category_btn" },
        ],
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      await optionsEdit(
        botReplies[37],
        query.message.chat.id,
        bot,
        inline_keyboard,
        messageId
      );
      return;
    case "add_new_income_category_btn":
      newUserCategory.type = "INGRESO";
      newUserCategory.user_id = currentUser.id;
      inline_keyboard = [
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      await optionsEdit(
        botReplies[36],
        query.message.chat.id,
        bot,
        inline_keyboard,
        messageId
      );
      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_NEW_CATEGORY,
      };
      return;
    case "add_new_expense_category_btn":
      newUserCategory.type = "EGRESO";
      newUserCategory.user_id = currentUser.id;
      inline_keyboard = [
        [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
      ];
      await optionsEdit(
        botReplies[36],
        query.message.chat.id,
        bot,
        inline_keyboard,
        messageId
      );
      userStates[query.message.chat.id] = {
        state: STATES.WAITING_FOR_NEW_CATEGORY,
      };
      return;
    case "confirm_add_new_category_btn":
      if (
        userStates[query.message.chat.id].state !== "waiting_for_confirmation"
      ) {
        return;
      }
      const addNewCategory = await insertNewTransactionCategory(
        newUserCategory
      );
      if (!addNewCategory.success) {
        await messageSender(query.message.chat.id, addNewCategory.error, bot);
      }
      await messageSender(
        query.message.chat.id,
        botReplies[39].replace("$category", newUserCategory.name),
        bot
      );
      await new Promise((resolve) => setTimeout(resolve, 200));
      await sendMenu(query.message.chat.id, bot);
      return;
    case "edit_exist_category_btn":
      inline_keyboard = [
        [
          { text: "Ingreso", callback_data: "edit_income_categories_btn" },
          { text: "Egreso", callback_data: "edit_expenses_categories_btn" },
        ],
        [{ text: "cancelar", callback_data: "back_to_menu_btn" }],
      ];
      optionsEdit(
        botReplies[40],
        query.message.chat.id,
        bot,
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
      optionsEdit(
        botReplies[41],
        query.message.chat.id,
        bot,
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
      optionsEdit(
        botReplies[41],
        query.message.chat.id,
        bot,
        inline_keyboard,
        messageId
      );
      return;
      case "confirm_edit_category_name":
        if (
          userStates[query.message.chat.id].state !== "waiting_for_confirmation"
        ) {
          return;
        }
        const editCategoryName = await updateUserCategory(editCategoryObject)
        if (!editCategoryName.success){
          await messageSender(query.message.chat.id, editCategoryName.error, bot)
          return
        }
        await messageSender(query.message.chat.id, botReplies[44], bot)
        await new Promise((resolve) => setTimeout(resolve, 200));
        await sendMenu(query.message.chat.id, bot);
      return
    default:
      if (query.data.startsWith("category-selection-option")) {
        newUserRecord.category = query.data.split(":")[1];
        const { type, details, ammount, category } = newUserRecord;
        confirmationMessage = botReplies[26]
          .replace("$type", type)
          .replace("$details", details)
          .replace(
            "$ammount",
            `${await numberFormater(ammount, currentUser.currency)}`
          )
          .replace("$category", category);
        userStates[query.message.chat.id] = STATES.WAITING_FOR_CONFIRMATION;
        await sendConfirmation(
          confirmationMessage,
          "confirm_transaction",
          bot,
          query.message.chat.id
        );
      } else if (query.data.startsWith("balance-month")) {
        selectedMonth = query.data.split("-")[2];
        const incomeBalanceByMonth = await fetchBalanceByMonth(
          query.message.chat.id,
          selectedMonth,
          "INGRESO"
        );
        const expensesBalanceByMonth = await fetchBalanceByMonth(
          query.message.chat.id,
          selectedMonth,
          "EGRESO"
        );
        const savingsBalanceByMonth = await fetchBalanceByMonth(
          query.message.chat.id,
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
          textMesssage = botReplies[33]
            .replace("$month", await getMonthString(selectedMonth))
            .replace("$currentYear", new Date().getFullYear());
          inline_keyboard = [
            [{ text: "Regresar", callback_data: "back_to_menu_btn" }],
          ];
        } else {
          textMesssage = botReplies[32]
            .replace("$month", await getMonthString(selectedMonth))
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
            [{ text: "Regresar", callback_data: "back_to_menu_btn" }],
            [
              {
                text: "Ver detalles",
                callback_data: "see_balance_details-btn",
              },
            ],
          ];
        }
        await optionsEdit(
          textMesssage,
          query.message.chat.id,
          bot,
          inline_keyboard,
          messageId
        );
      } else if (query.data.startsWith("category-edit-selection-option")) {
        let categoryName = query.data.split(":")[1];
        inline_keyboard = [
          [{ text: "Cancelar", callback_data: "back_to_menu_btn" }],
        ];
        userStates[query.message.chat.id] = {
          state: STATES.WAITING_FOR_CATEGORY_EDIT,
        };
        optionsEdit(
          botReplies[42].replace("$category", categoryName),
          query.message.chat.id,
          bot,
          inline_keyboard,
          messageId
        );
        editCategoryObject.oldName = categoryName
        editCategoryObject.user_id = currentUser.id
      }
      break;
  }
  console.log("query data: ", query.data);
}
