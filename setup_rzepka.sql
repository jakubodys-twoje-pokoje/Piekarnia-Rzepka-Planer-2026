
-- 1. Tabela Inwentarza (Towary)
CREATE TABLE IF NOT EXISTS public.inventory (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    code text,
    section text NOT NULL, -- 'Piekarnia' | 'Cukiernia'
    category text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Tabela Zamówień (Nagłówki)
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_date date DEFAULT current_date,
    delivery_date date NOT NULL,
    status text DEFAULT 'pending', -- 'pending' | 'completed' | 'cancelled'
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Tabela Pozycji Zamówienia (Szczegóły)
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.inventory(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 0,
    CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

-- Uprawnienia RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Widoczność towarów dla wszystkich" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Admin zarządza towarami" ON public.inventory FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Widoczność zamówień dla admina i punktu" ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
    location_id IN (SELECT default_location_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Tworzenie zamówień przez zalogowanych" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Tworzenie pozycji zamówień przez zalogowanych" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Widoczność pozycji dla uprawnionych" ON public.order_items FOR SELECT USING (true);

-- IMPORT LISTY TOWARÓW (SEED DATA)
INSERT INTO public.inventory (name, code, section, category) VALUES
-- PIEKARNIA - CHLEBY
('BALTONOWSKI / KR', '1/2', 'Piekarnia', 'Chleby'),
('BALTONOWSKI MAŁY / KR', '3/4', 'Piekarnia', 'Chleby'),
('BALTONOWSKI SEZAM-MAK / KR', '5/6', 'Piekarnia', 'Chleby'),
('GRAHAM DUŻY / KR', '7/8', 'Piekarnia', 'Chleby'),
('IG / KR', '9/10', 'Piekarnia', 'Chleby'),
('KUKURYDZIANY / KR', '10/11', 'Piekarnia', 'Chleby'),
('GRYCZANIN / KR', '12/13', 'Piekarnia', 'Chleby'),
('BABUNI / KR', '14/15', 'Piekarnia', 'Chleby'),
('ZE WSI / KR', '16/17', 'Piekarnia', 'Chleby'),
('JAK DAWNIEJ / KR', '18/19', 'Piekarnia', 'Chleby'),
('ŻYTNI Z PISTACJĄ', '', 'Piekarnia', 'Chleby'),
('CEBULOWY / KR', '22/23', 'Piekarnia', 'Chleby'),
('KETO', '', 'Piekarnia', 'Chleby'),
('MIODOWY-ORKISZ', '26/27', 'Piekarnia', 'Chleby'),
('TOSTOWY MAŁY', '30/31', 'Piekarnia', 'Chleby'),
('TOSTOWY DŁUGI / KR', '32/33', 'Piekarnia', 'Chleby'),
('ŻYTNI PEŁNOZIARNISTY / KR', '34/35', 'Piekarnia', 'Chleby'),
('MAŚLANKA', '36/37', 'Piekarnia', 'Chleby'),
('ŻYTNI BEZ DROŻDZY / KR', '38/39', 'Piekarnia', 'Chleby'),
('ŻYTNI BEZ DROŻ. Z ZIARNE/KR', '40/41', 'Piekarnia', 'Chleby'),
('ŻYTNI BEZ DROŻ. Z DYNIĄ / KR', '42/43', 'Piekarnia', 'Chleby'),
('ŻYTNI BEZ DR Z ŻURAWINĄ/KR', '44/45', 'Piekarnia', 'Chleby'),
('ŻYTNI BEZ DR ZE SŁONECZ / KR', '46/47', 'Piekarnia', 'Chleby'),
('ŻYTNI BEZ DR Z ORZECHEM', '48/49', 'Piekarnia', 'Chleby'),
('JAGLANY', '50/51', 'Piekarnia', 'Chleby'),
('RZEMIEŚLNICZY / KR', '52/53', 'Piekarnia', 'Chleby'),
('HEROS / KR', '54/55', 'Piekarnia', 'Chleby'),
('DUŃSKI', '56/57', 'Piekarnia', 'Chleby'),
('PROBODY', '58/59', 'Piekarnia', 'Chleby'),
('FITNESS / KR', '60/61', 'Piekarnia', 'Chleby'),
('CHIA / OWSIANKA', '62/63', 'Piekarnia', 'Chleby'),
('TOSKAŃSKI / KR', '71/72', 'Piekarnia', 'Chleby'),
('OWSIANY', '', 'Piekarnia', 'Chleby'),
('ORKISZOWY', '', 'Piekarnia', 'Chleby'),
('PARYSKI', '', 'Piekarnia', 'Chleby'),
-- PIEKARNIA - BUŁKI
('KAJZERKA ZIARNA PSZ / ŻYT', '92', 'Piekarnia', 'Bułki'),
('PALUCH MAIZANO', '93', 'Piekarnia', 'Bułki'),
('SEROWO-DYNIOWA', '94', 'Piekarnia', 'Bułki'),
('DWORSKA / MULTIZIARNO', '95', 'Piekarnia', 'Bułki'),
('GRAHAMKA ZWYKŁA', '100', 'Piekarnia', 'Bułki'),
('GRAHAMKA LNIANA', '101', 'Piekarnia', 'Bułki'),
('BUŁKA IG', '102', 'Piekarnia', 'Bułki'),
('WYBOROWA / ROGAL', '103', 'Piekarnia', 'Bułki'),
('BUŁKA ZE SZPINAKIEM', '105', 'Piekarnia', 'Bułki'),
('BUŁKA JOGURTOWA', '106', 'Piekarnia', 'Bułki'),
('DUŻA ZWYKŁA', '107', 'Piekarnia', 'Bułki'),
('MAŁA ZWYKŁA', '108', 'Piekarnia', 'Bułki'),
('BUŁKA ŻYTNIA', '109', 'Piekarnia', 'Bułki'),
('PALUCH CZOSNKOWY', '110', 'Piekarnia', 'Bułki'),
('POCZEKAJKA', '111', 'Piekarnia', 'Bułki'),
('BUŁKA MAŚLANKA', '', 'Piekarnia', 'Bułki'),
('BUŁKA ORKISZOWA', '', 'Piekarnia', 'Bułki'),
-- PIEKARNIA - KANAPKI
('SAŁATKA', '64', 'Piekarnia', 'Kanapki'),
('KANAPKA CIABATTA', '67', 'Piekarnia', 'Kanapki'),
('KANAPKA MULTI-ZIARNO', '68', 'Piekarnia', 'Kanapki'),
('KANAPKA IG', '69', 'Piekarnia', 'Kanapki'),
('KANAPKA MINI-BAGIETKA', '70', 'Piekarnia', 'Kanapki'),
-- PIEKARNIA - SŁODKIE / PRZEKĄSKI
('DROŻDŻÓWKA Z OWOCEM', '85', 'Piekarnia', 'Wyroby Słodkie'),
('JABŁUSZKO Z JABŁUSZKIEM', '86', 'Piekarnia', 'Wyroby Słodkie'),
('SZNEKA', '87', 'Piekarnia', 'Wyroby Słodkie'),
('CYNAMONKA', '88', 'Piekarnia', 'Wyroby Słodkie'),
('CHAŁKA RODZYNKOWA', '89', 'Piekarnia', 'Wyroby Słodkie'),
('CHAŁKA KRUSZONKA', '112', 'Piekarnia', 'Wyroby Słodkie'),
('MINI PIZZA/ WĘGIERSKA', '90', 'Piekarnia', 'Inne'),
('BUŁKA PIZZOWA', '91', 'Piekarnia', 'Inne'),
('PASZTECIK', '97', 'Piekarnia', 'Inne'),
('HOT-DOG', '98', 'Piekarnia', 'Inne'),
('PODPŁOMYK BOCZEK', '99', 'Piekarnia', 'Inne'),
-- CUKIERNIA
('PĄCZEK CZEKOLADA', '81', 'Cukiernia', 'Pączki'),
('PĄCZEK PISTACJA', '', 'Cukiernia', 'Pączki'),
('PĄCZEK Z ADWOKATEM', '', 'Cukiernia', 'Pączki'),
('EKLER', '', 'Cukiernia', 'Ciastka & Desery'),
('GNIAZDKO', '82', 'Cukiernia', 'Ciastka & Desery'),
('FRANCUSKIE SER/ WIŚ/JABŁ', '83', 'Cukiernia', 'Ciastka & Desery'),
('WIENIEC', '84', 'Cukiernia', 'Ciastka & Desery'),
('SERNIK', '', 'Cukiernia', 'Ciasta'),
('BROWNIE', '', 'Cukiernia', 'Ciasta'),
('JABŁECZNIK', '', 'Cukiernia', 'Ciasta'),
('BEZA PAVLOVA', '', 'Cukiernia', 'Ciasta'),
('BEZOWA CHMURKA', '', 'Cukiernia', 'Ciasta'),
('PIERNIK', '', 'Cukiernia', 'Ciasta'),
('ZIELONY MECH', '', 'Cukiernia', 'Ciasta'),
('KOSTKA MALINOWA', '', 'Cukiernia', 'Kostki'),
('KOSTKA TOFFI', '', 'Cukiernia', 'Kostki'),
('KOSTKA HISZPAŃSKA', '', 'Cukiernia', 'Kostki'),
('SERNIK PISTACJOWY', '', 'Cukiernia', 'Ciasta')
ON CONFLICT DO NOTHING;
