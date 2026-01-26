
-- ... (poprzednia treść)

-- 7. Tabela komunikatów (rozszerzona)
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_location_id uuid REFERENCES public.locations(id) ON DELETE CASCADE,
    to_admin boolean DEFAULT false,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Uprawnienia RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read relevant messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR 
  recipient_location_id IS NULL OR 
  recipient_location_id IN (SELECT default_location_id FROM public.profiles WHERE id = auth.uid()) OR
  (to_admin = true AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);
CREATE POLICY "Everyone can insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Recipients can update is_read" ON public.messages FOR UPDATE USING (true);
