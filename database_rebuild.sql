-- ============================================================
-- SKRYPT PRZEBUDOWY BAZY DANYCH PIEKARNIA RZEPKA
-- Wersja: 4.0 - KOMPLETNA PRZEBUDOWA
-- ============================================================
-- UWAGA: Ten skrypt USUNIE WSZYSTKIE DANE!
-- Uruchom w Supabase SQL Editor
-- ============================================================

-- ============================================================
-- KROK 1: USUNIĘCIE WSZYSTKICH DANYCH
-- ============================================================

-- Wyłącz RLS tymczasowo
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.targets DISABLE ROW LEVEL SECURITY;

-- Usuń triggery
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Usuń wszystkie dane z tabel (w kolejności zależności)
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.targets CASCADE;
TRUNCATE TABLE public.daily_reports CASCADE;
TRUNCATE TABLE public.messages CASCADE;
TRUNCATE TABLE public.inventory CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.locations CASCADE;

-- Usuń WSZYSTKICH użytkowników z auth (włącznie z identities)
DELETE FROM auth.identities;
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
DELETE FROM auth.mfa_factors;
DELETE FROM auth.mfa_challenges;
DELETE FROM auth.mfa_amr_claims;
DELETE FROM auth.users;

-- ============================================================
-- KROK 2: PRZEBUDOWA TABEL (świeży schemat)
-- ============================================================

-- Usuń stare tabele
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.targets CASCADE;
DROP TABLE IF EXISTS public.daily_reports CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;

-- Lokalizacje
CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    address text,
    status text DEFAULT 'aktywny',
    created_at timestamp with time zone DEFAULT now()
);

-- Profile użytkowników
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE,
    role text DEFAULT 'user',
    first_name text,
    last_name text,
    default_location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Raporty dzienne
CREATE TABLE public.daily_reports (
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

-- Wiadomości
CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient_location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
    to_admin boolean DEFAULT false,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Inwentarz/Produkty
CREATE TABLE public.inventory (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    code text,
    section text NOT NULL,
    category text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- Zamówienia
CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id),
    order_date date DEFAULT CURRENT_DATE,
    delivery_date date NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

-- Pozycje zamówień
CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.inventory(id) ON DELETE CASCADE,
    quantity integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Cele/Budżety
CREATE TABLE public.targets (
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

-- ============================================================
-- KROK 3: TRIGGER DLA AUTOMATYCZNEGO PROFILU
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = COALESCE(EXCLUDED.role, profiles.role),
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- KROK 4: ROW LEVEL SECURITY
-- ============================================================

-- Profiles i locations - dostęp dla wszystkich zalogowanych (bez RLS)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;

-- Pozostałe tabele - RLS z polityką dla zalogowanych
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;

-- Usuń stare polityki (jeśli istnieją)
DROP POLICY IF EXISTS "allow_all_auth" ON public.daily_reports;
DROP POLICY IF EXISTS "allow_all_auth" ON public.messages;
DROP POLICY IF EXISTS "allow_all_auth" ON public.inventory;
DROP POLICY IF EXISTS "allow_all_auth" ON public.orders;
DROP POLICY IF EXISTS "allow_all_auth" ON public.order_items;
DROP POLICY IF EXISTS "allow_all_auth" ON public.targets;

-- Nowe polityki
CREATE POLICY "allow_all_auth" ON public.daily_reports FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_auth" ON public.messages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_auth" ON public.inventory FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_auth" ON public.orders FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_auth" ON public.order_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "allow_all_auth" ON public.targets FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================
-- KROK 5: WŁĄCZ REALTIME DLA MESSAGES
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================================
-- GOTOWE! Teraz:
-- 1. Uruchom KROK 6 (lokalizacje) w osobnym query
-- 2. Dodaj użytkowników przez Dashboard Supabase
-- ============================================================
