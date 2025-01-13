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
    console.log(error);
  }
}

export async function createNewUser(chatId, first_name ) {
  const { error } = await supabase
    .from("users")
    .insert({ first_name: first_name, telegram_id: chatId, created_at: new Date() });
    if (error) {
      console.log(error);
    }
}
