import { createClient } from '@supabase/supabase-js';

// Parametry produkcyjne Piekarni Rzepka
const supabaseUrl = 'https://tymakcndlzhyfvmkhjkn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bWFrY25kbHpoeWZ2bWtoamtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzI5MjcsImV4cCI6MjA4NDU0ODkyN30.e2oOyJX2fK9cOcDBkszbmrVE7Mg-PRVZPYYHKopCZmY';

// Flaga informująca system, że baza jest gotowa
export const isSupabaseConfigured = true;

// Inicjalizacja klienta
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("✅ System Rzepka: Połączono z bazą produkcyjną v2.2.1");
