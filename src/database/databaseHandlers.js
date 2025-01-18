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
  const { error } = await supabase.from("users").insert({
    first_name: userProfile.first_name,
    last_name: userProfile.last_name,
    telegram_username: userProfile.username,
    telegram_id: chatId,
    created_at: new Date(),
    email: userProfile.email,
    currency: userProfile.currency,
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
  console.log(newTransactionCategory)
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
