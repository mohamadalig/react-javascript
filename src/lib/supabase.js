import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const backendOn = Boolean(url && key);

if (!backendOn) {
  console.warn(
    "[لوجا شاپ] بک‌اند وصل نیست: فایل .env را با VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY بسازید و سرور را ری‌استارت کنید. برنامه فعلاً در حالت دمو کار می‌کند."
  );
}

export const supabase = backendOn ? createClient(url, key) : null;