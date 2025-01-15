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
  const { error } = await supabase
    .from("users")
    .insert({
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
