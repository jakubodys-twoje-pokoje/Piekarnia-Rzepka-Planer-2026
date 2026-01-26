
-- SKRYPT KOMPLETNY v3.7 - NAPRAWIA BŁĄD 400 I 500
-- 1. CZYSZCZENIE STARYCH ELEMENTÓW (TYLKO TRIGGEY)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. WYŁĄCZENIE RLS DLA PROFILI I LOKALIZACJI (STABILNOŚĆ)
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.locations DISABLE ROW LEVEL SECURITY;

-- 3. TABELE PODSTAWOWE
CREATE TABLE IF NOT EXISTS public.locations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    address text,
    status text DEFAULT 'aktywny',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE,
    role text DEFAULT 'user',
    first_name text,
    last_name text,
    default_location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 4. TABELE OPERACYJNE (RAPORTY I KOMUNIKATY)
CREATE TABLE IF NOT EXISTS public.daily_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL,
    location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    bakery_sales numeric DEFAULT 0,
    bakery_loss numeric DEFAULT 0,
    pastry_sales numeric DEFAULT 0,
    pastry_loss numeric DEFAULT 0,
    verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(date, location_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient_location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
    to_admin boolean DEFAULT false,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. TABELE ZAMÓWIEŃ I MAGAZYNU
CREATE TABLE IF NOT EXISTS public.inventory (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    code text,
    section text NOT NULL,
    category text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id),
    order_date date DEFAULT CURRENT_DATE,
    delivery_date date NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.inventory(id) ON DELETE CASCADE,
    quantity integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.targets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
    week_number integer NOT NULL,
    year integer NOT NULL,
    bakery_daily_target numeric DEFAULT 0,
    bakery_loss_target numeric DEFAULT 0,
    pastry_daily_target numeric DEFAULT 0,
    pastry_loss_target numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(location_id, week_number, year)
);

-- 6. WYZWALACZ AUTOPROFILU
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. RLS - DOSTĘP DLA ZALOGOWANYCH
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_auth" ON public.daily_reports FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_auth" ON public.messages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_auth" ON public.inventory FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_auth" ON public.orders FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_auth" ON public.order_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_auth" ON public.targets FOR ALL USING (auth.uid() IS NOT NULL);

-- DANE STARTOWE (TYLKO JEŚLI PUSTO)
INSERT INTO public.locations (name, address) 
SELECT 'CENTRUM', 'ul. Kupiecka 1' WHERE NOT EXISTS (SELECT 1 FROM public.locations LIMIT 1);
