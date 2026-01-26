
-- SKRYPT NAPRAWCZY PIEKARNIA RZEPKA v3.2 (KLINICZNY)

-- 1. USUNIĘCIE STARYCH POLITYK (CZYSTOŚĆ)
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP 
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 2. FUNKCJE BEZPIECZEŃSTWA (SECURITY DEFINER bypassuje RLS)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. TABELE (Upewnienie się że istnieją)
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

-- 4. WŁĄCZENIE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- 5. NOWE, PROSTE POLITYKI (BEZ REKURENCJI)

-- PROFILES: Każdy widzi siebie, Admin widzi wszystkich
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT USING (public.check_is_admin());
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.check_is_admin());

-- LOCATIONS: Każdy widzi, tylko Admin edytuje
CREATE POLICY "locations_public_select" ON public.locations FOR SELECT USING (true);
CREATE POLICY "locations_admin_all" ON public.locations FOR ALL USING (public.check_is_admin());

-- DAILY REPORTS: Każdy widzi swoje/wszystkie, Admin ma pełną władzę
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
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select" ON public.daily_reports FOR SELECT USING (
    public.check_is_admin() OR 
    location_id IN (SELECT default_location_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "reports_insert" ON public.daily_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "reports_admin_all" ON public.daily_reports FOR ALL USING (public.check_is_admin());

-- INWENTARZ I ZAMÓWIENIA (Pełny dostęp dla zalogowanych dla uproszczenia debugowania)
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_all" ON public.inventory FOR ALL USING (true);
CREATE POLICY "orders_all" ON public.orders FOR ALL USING (true);
CREATE POLICY "order_items_all" ON public.order_items FOR ALL USING (true);
CREATE POLICY "messages_all" ON public.messages FOR ALL USING (true);

-- DANE STARTOWE (Tylko jeśli puste)
INSERT INTO public.locations (name, address) 
SELECT 'CENTRUM', 'ul. Kupiecka 1' WHERE NOT EXISTS (SELECT 1 FROM public.locations LIMIT 1);
