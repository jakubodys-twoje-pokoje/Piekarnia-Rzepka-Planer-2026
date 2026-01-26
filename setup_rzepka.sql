
-- KOMPLETNY SKRYPT BAZY DANYCH PIEKARNIA RZEPKA v3.0

-- 1. TABELA PROFILI (UŻYTKOWNICY)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE,
    role text DEFAULT 'user', -- 'admin' | 'user' | 'apprentice'
    first_name text,
    last_name text,
    default_location_id uuid,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. TABELA LOKALIZACJI (PUNKTY SPRZEDAŻY)
CREATE TABLE IF NOT EXISTS public.locations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    address text,
    status text DEFAULT 'aktywny',
    created_at timestamp with time zone DEFAULT now()
);

-- Połącz default_location_id z tabelą locations (po stworzeniu obu)
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_location 
FOREIGN KEY (default_location_id) REFERENCES public.locations(id) ON DELETE SET NULL;

-- 3. TABELA RAPORTÓW DZIENNYCH
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

-- 4. TABELA KOMUNIKATÓW
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
    to_admin boolean DEFAULT false,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. TABELA CELÓW (BUDŻETOWANIE)
CREATE TABLE IF NOT EXISTS public.targets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
    year integer NOT NULL,
    week_number integer NOT NULL,
    bakery_daily_target numeric DEFAULT 0,
    bakery_loss_target numeric DEFAULT 0,
    pastry_daily_target numeric DEFAULT 0,
    pastry_loss_target numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(location_id, year, week_number)
);

-- 6. TABELA INWENTARZA (TOWARY)
CREATE TABLE IF NOT EXISTS public.inventory (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    code text,
    section text NOT NULL, -- 'Piekarnia' | 'Cukiernia'
    category text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 7. TABELA ZAMÓWIEŃ
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_date date DEFAULT current_date,
    delivery_date date NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT now()
);

-- 8. TABELA POZYCJI ZAMÓWIENIA
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.inventory(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 0
);

-- WŁĄCZENIE RLS (BEZPIECZEŃSTWO)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- POLITYKI DOSTĘPU (PRZYKŁADY)
CREATE POLICY "Publiczna widoczność lokalizacji" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Publiczna widoczność towarów" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Profile dostępne dla zalogowanych" ON public.profiles FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin zarządza wszystkim" ON public.daily_reports FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Użytkownik widzi swoje raporty" ON public.daily_reports FOR SELECT USING (location_id IN (SELECT default_location_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Użytkownik dodaje raporty" ON public.daily_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Zalogowani widzą komunikaty" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Zalogowani wysyłają komunikaty" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admin zarządza zamówieniami" ON public.orders FOR ALL USING (true);
CREATE POLICY "Wgląd w pozycje zamówień" ON public.order_items FOR ALL USING (true);

-- SEED DATA (DANE STARTOWE)
INSERT INTO public.locations (name, address) VALUES 
('FABRYCZNA', 'ul. Fabryczna 1'),
('JĘDRZYCHÓW', 'ul. Diamentowa 2'),
('KUPIECKA', 'ul. Kupiecka 10'),
('ŁĘŻYCA', 'ul. Odrzańska 5'),
('NIEPODLEGŁOŚCI', 'ul. Niepodległości 20'),
('PLAC POCZTOWY', 'Plac Pocztowy 1')
ON CONFLICT DO NOTHING;

INSERT INTO public.inventory (name, code, section, category) VALUES
('BALTONOWSKI / KR', '1/2', 'Piekarnia', 'Chleby'),
('BALTONOWSKI MAŁY / KR', '3/4', 'Piekarnia', 'Chleby'),
('GRAHAM DUŻY / KR', '7/8', 'Piekarnia', 'Chleby'),
('KAJZERKA ZIARNA', '92', 'Piekarnia', 'Bułki'),
('DROŻDŻÓWKA Z OWOCEM', '85', 'Piekarnia', 'Wyroby Słodkie'),
('PĄCZEK CZEKOLADA', '81', 'Cukiernia', 'Pączki'),
('SERNIK', '', 'Cukiernia', 'Ciasta')
ON CONFLICT DO NOTHING;
