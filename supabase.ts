
// Tryb DEMO: Supabase jest wyłączony, aby umożliwić prezentację bez konfiguracji backendu.
export const supabase = {
  from: () => ({
    select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
    insert: () => Promise.resolve({ error: null }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: {} }, error: null }),
  }
};
