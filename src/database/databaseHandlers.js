import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { encrypText } from "../helpers/encryptText.js";
import { adjustToLocalTime } from "../utils/dateFormater.js";
import { botErrorMessages } from "../messages/botErrorMessages.js";
dotenv.config();
const supabaseUrl = "https://cahmyhmvtrnmrlktnjlf.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchUsers() {
  const { data, error } = await supabase.from("users").select();
  if (data) {
    return data;
  } else {
    console.log(
      "error realizando fetch de los users de la base de datos ",
      error
    );
  }
}

export async function createNewUser(chatId, userProfile) {
  let userHasNoUsername = false;
  try {
    const {
      first_name,
      last_name,
      telegram_username,
      email,
      currency,
      user_iv,
    } = userProfile;
    if (!telegram_username) {
      return { success: false, error: botErrorMessages[2] };
    }
    const { error } = await supabase.from("users").insert({
      first_name: first_name
        ? encrypText(first_name.toLowerCase(), user_iv)
        : null,
      last_name: last_name
        ? encrypText(last_name.toLowerCase(), user_iv)
        : null,
      telegram_username: encrypText(telegram_username, user_iv) || null,
      telegram_id: chatId,
      email: email ? encrypText(email.toLowerCase(), user_iv) : null,
      currency: currency || null,
      user_iv: user_iv || null,
      created_at: adjustToLocalTime(new Date()),
    });
    if (error) {
      throw error;
    } else {
      return { success: true, error: "" };
    }
  } catch (error) {
    console.log("Error creando un usuario nuevo a la base de datos", error);
    return {
      success: false,
      error: "Error creando un usuario nuevo a la base de datos",
    };
  }
}

export async function fetchCurrentUser(telegram_id) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegram_id);
    if (error) {
      throw error;
    } else {
      return data[0];
    }
  } catch (error) {
    console.log("Error extrayendo este usuario", error);
  }
}

export async function fetchCurrentUserId(telegram_id) {
  let userId = "";
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", telegram_id);
    if (error) {
      throw error;
    } else {
      if (data.length < 0) {
        throw new Error("No se encontro el usuario");
      } else {
        userId = data[0].id;
        return userId;
      }
    }
  } catch (error) {
    console.log("Error extrayendo este usuario", error);
  }
}

export async function insertNewTransactionCategory(newTransactionCategory) {
  try {
    const { error } = await supabase.from("categories").insert({
      name: newTransactionCategory.name,
      user_id: newTransactionCategory.user_id,
      type: newTransactionCategory.type,
    });
    if (error) {
      throw error;
    } else {
      return { success: true, error: "" };
    }
  } catch (error) {
    console.log("Error insertando nueva categoria", error);
    return { success: false, error: error };
  }
}

async function fetchCategoryId(categoryName, userId) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("name", categoryName);
    if (error) {
      throw error;
    }
    return data[0].id;
  } catch (error) {
    console.log(error);
  }
}

export async function createNewRecord(newUserRecord) {
  const { details, ammount, created_at, user_id, category, type } =
    newUserRecord;
  let categoryId = 0;
  if (category !== "AHORROS" && category !== "") {
    categoryId = await fetchCategoryId(category, user_id);
  } else {
    categoryId = null;
  }
  try {
    const { error } = await supabase.from("records").insert({
      detalles: details,
      monto: ammount,
      created_at: created_at,
      user_id: user_id,
      category_id: categoryId || null,
      record_type: type,
    });
    if (error) {
      throw error;
    } else {
      return { success: true, error: "" };
    }
  } catch (error) {
    console.log(
      "Error intentando guardar movimiento a la base de datos ",
      error
    );
    return {
      success: false,
      error: "Error intentando guardar movimiento a la base de datos ",
    };
  }
}

export async function createNewSaving(newSaving) {
  const { ammount, user_id, created_at } = newSaving;
  try {
    const { error } = await supabase.from("savings").insert({
      created_at: created_at,
      ammount: ammount,
      user_id: user_id,
    });
    if (error) {
      throw error;
    } else {
      return { success: true, error: "" };
    }
  } catch (error) {
    console.log(
      "Error intentando guardar los ahorros a la base de datos ",
      error
    );
    return {
      success: false,
      error: "Error intentando guardar los ahorros a la base de datos ",
    };
  }
}

export async function editProfile(editProfileObject, user_id) {
  const { category, value } = editProfileObject;
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ [category]: value })
      .eq("id", user_id)
      .select();

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      return {
        success: false,
        error: "No se encontró el usuario con el ID proporcionado",
      };
    }

    return { success: true, error: "" };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error intentando editar el perfil" };
  }
}

export async function fetchUserCategories(chatId, type) {
  try {
    const userId = await fetchCurrentUserId(chatId);
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .eq("user_id", userId)
      .eq("type", type);
    if (error) {
      throw error;
    } else {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
}

export async function fetchTransactionsAndBalance(userId, type) {
  let userIncome = 0;
  try {
    const { data, error } = await supabase
      .from("records")
      .select("monto")
      .eq("record_type", type)
      .eq("user_id", userId);
    if (error) {
      throw error;
    }
    userIncome = data.reduce((acc, cur) => acc + cur.monto, 0);
    return userIncome;
  } catch (error) {
    console.log(error);
  }
}

function getRange(month) {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, month, 1);
  const endDate = new Date(currentYear, month + 1, 0);
  endDate.setHours(23, 59, 59, 999);
  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}
export async function fetchBalanceByMonth(userId, month, type) {
  const { start, end } = getRange(month);
  let totalAmmount = 0;
  const user_id = await fetchCurrentUserId(userId);
  try {
    const { data, error } = await supabase
      .from("records")
      .select("monto")
      .gte("created_at", start)
      .lte("created_at", end)
      .eq("user_id", user_id)
      .eq("record_type", type);
    if (error) {
      throw error;
    }
    totalAmmount = data.reduce((acc, cur) => acc + cur.monto, 0);
    return totalAmmount;
  } catch (error) {
    console.log("error haciendo fetch por mes", error);
  }
}

export async function updateUserCategory(newCategory) {
  const { oldName, newName, user_id } = newCategory;
  try {
    const categoryId = await fetchCategoryId(oldName, user_id);
    const { error } = await supabase
      .from("categories")
      .update({ name: newName })
      .eq("id", categoryId)
      .eq("user_id", user_id);

    if (error) {
      throw error;
    }
    return { success: true, error: "" };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error actualizando la categoria" };
  }
}

export async function fetchTransactionsList(userId, pageNumber) {
  try {
    const start = (pageNumber - 1) * 10;
    const end = start + (10 - 1);
    const { data, error } = await supabase
      .from("records")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(start, end)
      .limit(10);
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchTransactionById(transactionId) {
  try {
    const { data, error } = await supabase
      .from("records")
      .select(
        `
        id,
        detalles,
        monto,
        created_at,
        user_id,
        category_id,
        record_type,
        categories(name)
      `
      )
      .eq("id", transactionId);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.log("Error extrayendo esta transaccion: ", error);
  }
}

export async function fetchAllUserCategories(userId, type) {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("name, id")
      .eq("user_id", userId)
      .eq("type", type);
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.log("Error extrayendo todas las categorias del usuario, ", error);
  }
}

export async function fetchAmmountByCategoriesandMonth(
  userId,
  categoryId,
  month
) {
  let totalAmmount = 0;
  try {
    const { start, end } = getRange(month);
    const { data, error } = await supabase
      .from("records")
      .select("monto")
      .eq("user_id", userId)
      .eq("category_id", categoryId)
      .gte("created_at", start)
      .lte("created_at", end);
    if (error) {
      throw error;
    }
    totalAmmount = data.reduce((acc, cur) => acc + cur.monto, 0);
    return totalAmmount;
  } catch (error) {
    console.log("Error realiando fetch por mes y categoria: ", error);
  }
}

export async function fetchInitialBalance(userId, month) {
  const { start, end } = getRange(month);
  let initialBalance = 0;
  try {
    const { data, error } = await supabase
      .from("records")
      .select("monto")
      .eq("detalles", "Balance Inicial")
      .eq("user_id", userId)
      .gte("created_at", start)
      .lte("created_at", end);
    if (error) {
      throw error;
    }
    if (data.length > 0) {
      initialBalance = data[0].monto;
    }
    return initialBalance;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchSavings(userId) {
  let totalAmmount = 0;
  try {
    const { data, error } = await supabase
      .from("savings")
      .select("ammount")
      .eq("user_id", userId);
    if (error) {
      throw error;
    }
    totalAmmount = data.reduce((acc, cur) => acc + cur.ammount, 0);
    return totalAmmount;
  } catch (error) {}
}

export async function editUserTimeZone(userId, newTimeZone) {
  try {
    const { error } = await supabase
      .from("users")
      .update({ timezone: newTimeZone })
      .eq("id", userId);
    if (error) {
      throw error;
    } else {
      return { success: true, error: "" };
    }
  } catch (error) {
    console.log("Error actualizando la zona horaria del usuario");
    return {
      success: false,
      error: "Error actualizando la zona horaria del usuario",
    };
  }
}

export async function deleteTransaction(transactionId) {
  try {
    const response = await supabase.from("records").delete().eq("id", transactionId);
    if (response.error){
      throw response.error;
    } else {
      return { success: true, error: "" };
    }
  } catch (error) {
    console.log(error);
    return { success: false, error: "Error eliminando la transaccion" };
  }
}
