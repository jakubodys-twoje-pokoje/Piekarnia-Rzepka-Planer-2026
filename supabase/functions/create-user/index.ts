import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header to verify the caller
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Brak autoryzacji')
    }

    // Create a client with the user's token to verify they're admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get the calling user and check if they're admin
    const { data: { user: callingUser }, error: userError } = await userClient.auth.getUser()
    if (userError || !callingUser) {
      throw new Error('Nie można zweryfikować użytkownika')
    }

    // Check if caller is admin
    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', callingUser.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      throw new Error('Tylko administrator może dodawać użytkowników')
    }

    // Parse the request body
    const { email, password, first_name, last_name, role, default_location_id } = await req.json()

    if (!email || !password) {
      throw new Error('Email i hasło są wymagane')
    }

    if (password.length < 6) {
      throw new Error('Hasło musi mieć minimum 6 znaków')
    }

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Create the user with Admin API (no email sending, no rate limits)
    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm, no email sent
      user_metadata: {
        first_name,
        last_name,
        role
      }
    })

    if (createError) {
      if (createError.message.includes('already been registered')) {
        throw new Error('Użytkownik z tym adresem email już istnieje')
      }
      throw createError
    }

    if (!authData.user) {
      throw new Error('Nie udało się utworzyć użytkownika')
    }

    // Create or update the profile
    const { error: profileInsertError } = await adminClient
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        role: role || 'user',
        first_name,
        last_name,
        default_location_id: default_location_id === 'none' ? null : default_location_id
      }, { onConflict: 'id' })

    if (profileInsertError) {
      // Try to clean up the auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id)
      throw new Error('Nie udało się utworzyć profilu: ' + profileInsertError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
