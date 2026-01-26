import { createClient } from '@supabase/supabase-js';

// Parametry z zmiennych środowiskowych
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Walidacja konfiguracji
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error('Brak konfiguracji Supabase. Sprawdź zmienne VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY w pliku .env.local');
}

// Inicjalizacja klienta
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

if (import.meta.env.DEV) {
  console.log("✅ System Rzepka: Połączono z bazą produkcyjną v2.2.1");
}
