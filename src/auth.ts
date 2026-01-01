import { supabase } from "./supabase";

export async function signIn(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  alert("Check your email for the login link!");
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.reload();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}