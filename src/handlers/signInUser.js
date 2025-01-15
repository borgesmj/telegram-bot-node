import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabaseUrl = "https://cahmyhmvtrnmrlktnjlf.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function signInUser(userProfile) {
  const { data, error } = await supabase.auth.signUp({
    email: userProfile.email,
    password: "example-password",
    options: {
      data: {
        display_name: userProfile.username, 
      },
    },
  });
}
