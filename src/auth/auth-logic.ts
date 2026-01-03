import { supabase } from "../db/supabase";

export async function login(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data.user;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.reload();
}

export async function checkSession() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
