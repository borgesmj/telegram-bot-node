import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
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
  const { first_name, last_name, username, email, currency } = userProfile;
  const { error } = await supabase.from("users").insert({
    first_name: first_name ? first_name.toLowerCase() : null,
    last_name: last_name ? last_name.toLowerCase() : null,
    telegram_username: username,
    telegram_id: chatId,
    email: email ? email.toLowerCase() : null,
    currency: currency || null,
  });
  if (error) {
    console.log("Error creando un usuario nuevo a la base de datos", error);
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

export async function createNewRecord(newUserRecord) {
  const { details, ammount, created_at, user_id, category, type } =
    newUserRecord;
  try {
    const { error } = await supabase.from("records").insert({
      detalles: details,
      monto: ammount,
      created_at: created_at,
      user_id: user_id,
      category_id: category || null,
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
  const { ammount, user_id } = newSaving;
  try {
    const { error } = await supabase.from("savings").insert({
      created_at: new Date(),
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

export async function editProfile(editProfileObject, chatId) {
  const { category, value } = editProfileObject;
  try {
    // ! pendiente hacer update de user
    const updateData = { [category]: value };
    const userId = await fetchCurrentUserId(chatId);
    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId);
    if (error) {
      throw error;
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
