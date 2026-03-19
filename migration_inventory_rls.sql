-- ============================================================
-- MIGRACJA: Usuwanie produktów tylko dla adminów
-- Data: 2026-03-19
-- ============================================================
-- Uruchom w Supabase SQL Editor
-- ============================================================

-- Usuń starą politykę "allow_all_auth" na inventory
DROP POLICY IF EXISTS "allow_all_auth" ON public.inventory;

-- Polityka SELECT - wszyscy zalogowani mogą przeglądać produkty
CREATE POLICY "inventory_select_auth" ON public.inventory
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Polityka INSERT - tylko admini mogą dodawać produkty
CREATE POLICY "inventory_insert_admin" ON public.inventory
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Polityka UPDATE - tylko admini mogą edytować produkty
CREATE POLICY "inventory_update_admin" ON public.inventory
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Polityka DELETE - tylko admini mogą usuwać produkty
CREATE POLICY "inventory_delete_admin" ON public.inventory
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- GOTOWE! Teraz tylko admin może dodawać/edytować/usuwać produkty
-- ============================================================
