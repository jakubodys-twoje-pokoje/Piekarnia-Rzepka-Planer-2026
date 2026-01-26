
-- ... (poprzednia treść skryptu)

-- 6. Tabela celów (targets) - brakujący element
CREATE TABLE IF NOT EXISTS public.targets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
    week_number integer NOT NULL CHECK (week_number BETWEEN 1 AND 53),
    year integer NOT NULL,
    bakery_daily_target numeric(10,2) DEFAULT 0,
    bakery_loss_target numeric(10,2) DEFAULT 5,
    bakery_loss_type text DEFAULT 'percent' CHECK (bakery_loss_type IN ('percent', 'amount')),
    pastry_daily_target numeric(10,2) DEFAULT 0,
    pastry_loss_target numeric(10,2) DEFAULT 5,
    pastry_loss_type text DEFAULT 'percent' CHECK (pastry_loss_type IN ('percent', 'amount')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(location_id, week_number, year)
);

-- Uprawnienia RLS dla targets
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access targets" ON public.targets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Everyone can read targets" ON public.targets FOR SELECT USING (true);
