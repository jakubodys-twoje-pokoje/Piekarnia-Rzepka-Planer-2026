
import { createClient } from '@supabase/supabase-js';

// Twoje dane produkcyjne - wpisane bezpośrednio, aby uniknąć błędów z window.env
const supabaseUrl = 'https://tymakcndlzhyfvmkhjkn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bWFrY25kbHpoeWZ2bWtoamtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzI5MjcsImV4cCI6MjA4NDU0ODkyN30.e2oOyJX2fK9cOcDBkszbmrVE7Mg-PRVZPYYHKopCZmY';

// Flaga gotowości systemu
export const isSupabaseConfigured = true;

// Inicjalizacja klienta
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("🚀 System Rzepka: Zainicjalizowano połączenie z bazą:", supabaseUrl);
