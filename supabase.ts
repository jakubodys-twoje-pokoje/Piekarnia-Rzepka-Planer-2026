
import { createClient } from '@supabase/supabase-js';

// Adresy i klucze pobierane z env lub window.env
const supabaseUrl = (window as any).env?.SUPABASE_URL || 'https://your-project.url.supabase.co';
const supabaseAnonKey = (window as any).env?.SUPABASE_ANON_KEY || 'your-anon-key';

// Flaga sprawdzająca czy URL jest poprawny
export const isSupabaseConfigured = 
  supabaseUrl !== 'https://your-project.url.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key';

if (!isSupabaseConfigured) {
  console.error("KRYTYCZNY BŁĄD: Supabase nie został skonfigurowany. Zmień URL i Klucz Anonimowy w pliku supabase.ts lub ustawieniach środowiska.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
