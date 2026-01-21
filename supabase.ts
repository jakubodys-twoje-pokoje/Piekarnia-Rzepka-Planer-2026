
import { createClient } from '@supabase/supabase-js';

// Zakładamy, że zmienne środowiskowe są dostępne w systemie
const supabaseUrl = (window as any).env?.SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = (window as any).env?.SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
