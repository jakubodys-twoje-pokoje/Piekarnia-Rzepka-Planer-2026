-- ============================================================
-- KROK 6: DODAWANIE LOKALIZACJI
-- Uruchom PO wykonaniu database_rebuild.sql
-- ============================================================
-- EDYTUJ PONIŻSZE DANE PRZED URUCHOMIENIEM!
-- Dodaj swoje lokalizacje (sklepy/piekarnie)
-- ============================================================

INSERT INTO public.locations (name, address, status) VALUES
-- Format: ('NAZWA SKLEPU', 'Adres', 'aktywny')
-- UWAGA: Nazwy muszą być UNIKALNE!

('CENTRUM', 'ul. Kupiecka 1, Miasteczko', 'aktywny'),
('RYNEK', 'Rynek Główny 15, Miasteczko', 'aktywny'),
('OSIEDLE', 'ul. Słoneczna 42, Miasteczko', 'aktywny');

-- Dodaj więcej lokalizacji według wzoru powyżej
-- ('NAZWA', 'Adres', 'aktywny'),

-- ============================================================
-- WERYFIKACJA - sprawdź czy lokalizacje się dodały
-- ============================================================
-- SELECT * FROM public.locations ORDER BY name;
