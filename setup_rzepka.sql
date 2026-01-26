
-- 1. Aktualizacja ograniczenia roli w tabeli profiles (dodanie 'apprentice')
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'user', 'apprentice'));

-- 2. Włączenie rozszerzenia pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 3. Konfiguracja lokalizacji
DELETE FROM public.locations;
INSERT INTO public.locations (id, name, address, status) VALUES
('00000000-0000-0000-0000-000000000001', 'PLAC POCZTOWY', 'Zielona Góra, Plac Pocztowy', 'aktywny'),
('00000000-0000-0000-0000-000000000002', 'FABRYCZNA', 'Zielona Góra, ul. Fabryczna', 'aktywny'),
('00000000-0000-0000-0000-000000000003', 'PODGÓRNA', 'Zielona Góra, ul. Podgórna', 'aktywny'),
('00000000-0000-0000-0000-000000000004', 'KUPIECKA', 'Zielona Góra, ul. Kupiecka', 'aktywny'),
('00000000-0000-0000-0000-000000000005', 'NIEPODLEGŁOŚCI', 'Zielona Góra, al. Niepodległości', 'aktywny'),
('00000000-0000-0000-0000-000000000006', 'JĘDRZYCHÓW', 'Zielona Góra, Jędrzychów', 'aktywny'),
('00000000-0000-0000-0000-000000000007', 'ŁĘŻYCA', 'Zielona Góra, Łężyca', 'aktywny');

-- 4. Funkcja do bezpiecznego tworzenia użytkowników
CREATE OR REPLACE FUNCTION create_rzepka_user(
    p_email text, 
    p_pass text, 
    p_first_name text, 
    p_last_name text, 
    p_role text, 
    p_location_id uuid DEFAULT NULL
) RETURNS void AS $$
DECLARE
    v_user_id uuid;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
            role, aud, confirmation_token
        ) VALUES (
            v_user_id, '00000000-0000-0000-0000-000000000000', p_email, 
            crypt(p_pass, gen_salt('bf')), now(), 
            '{"provider":"email","providers":["email"]}', '{}', now(), now(), 
            'authenticated', 'authenticated', ''
        );
    END IF;

    INSERT INTO public.profiles (
        id, email, role, first_name, last_name, default_location_id
    ) VALUES (
        v_user_id, p_email, p_role, p_first_name, p_last_name, p_location_id
    ) ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        default_location_id = EXCLUDED.default_location_id;
END;
$$ LANGUAGE plpgsql;

-- 5. MASOWY IMPORT PERSONELU (RAZEM 25 OSÓB)

-- ADMIN GŁÓWNY (1)
SELECT create_rzepka_user('mrzepka@rzepka.pl', 'MarekR@121', 'Marek', 'Rzepka', 'admin', NULL);

-- PLAC POCZTOWY (3)
SELECT create_rzepka_user('kkordzinska@rzepka.pl', 'KatarzynaK@121', 'Katarzyna', 'Kordzińska', 'user', '00000000-0000-0000-0000-000000000001');
SELECT create_rzepka_user('ikovalova@rzepka.pl', 'IrynaK@121', 'Iryna', 'Kovalova', 'user', '00000000-0000-0000-0000-000000000001');
SELECT create_rzepka_user('akubala@rzepka.pl', 'AngelikaK@121', 'Angelika', 'Kubala', 'user', '00000000-0000-0000-0000-000000000001');

-- FABRYCZNA (1)
SELECT create_rzepka_user('eslusarek@rzepka.pl', 'ElwiraS@121', 'Elwira', 'Ślusarek', 'user', '00000000-0000-0000-0000-000000000002');

-- PODGÓRNA (2)
SELECT create_rzepka_user('kstasiak@rzepka.pl', 'KatarzynaS@121', 'Katarzyna', 'Stasiak', 'user', '00000000-0000-0000-0000-000000000003');
SELECT create_rzepka_user('agrzegorzewska@rzepka.pl', 'AnnaG@121', 'Anna', 'Grzegorzewska', 'user', '00000000-0000-0000-0000-000000000003');

-- KUPIECKA (2)
SELECT create_rzepka_user('wkonwa@rzepka.pl', 'WiolettaK@121', 'Wioletta', 'Konwa', 'user', '00000000-0000-0000-0000-000000000004');
SELECT create_rzepka_user('jlitwinowicz@rzepka.pl', 'JadwigaL@121', 'Jadwiga', 'Litwinowicz', 'user', '00000000-0000-0000-0000-000000000004');

-- NIEPODLEGŁOŚCI (2)
SELECT create_rzepka_user('zbavdys@rzepka.pl', 'ZorianaB@121', 'Zoriana', 'Bavdys', 'user', '00000000-0000-0000-0000-000000000005');
SELECT create_rzepka_user('bnowak@rzepka.pl', 'BeataN@121', 'Beata', 'Nowak', 'user', '00000000-0000-0000-0000-000000000005');

-- JĘDRZYCHÓW (3)
SELECT create_rzepka_user('jsubsar@rzepka.pl', 'JoannaS@121', 'Joanna', 'Subsar', 'user', '00000000-0000-0000-0000-000000000006');
SELECT create_rzepka_user('bgorska@rzepka.pl', 'BozenaG@121', 'Bożena', 'Górska', 'user', '00000000-0000-0000-0000-000000000006');
SELECT create_rzepka_user('iswiderska@rzepka.pl', 'IwonaS@121', 'Iwona', 'Świderska', 'user', '00000000-0000-0000-0000-000000000006');

-- ŁĘŻYCA (2)
SELECT create_rzepka_user('mjundo@rzepka.pl', 'MonikaJ@121', 'Monika', 'Jundo', 'user', '00000000-0000-0000-0000-000000000007');
SELECT create_rzepka_user('apalasik@rzepka.pl', 'AnetaP@121', 'Aneta', 'Pałasik', 'user', '00000000-0000-0000-0000-000000000007');

-- BEZ STAŁEGO PUNKTU (2)
SELECT create_rzepka_user('wszopa@rzepka.pl', 'WiktoriaS@121', 'Wiktoria', 'Szopa', 'user', NULL);
SELECT create_rzepka_user('awilkowska@rzepka.pl', 'AnnaW@121', 'Anna', 'Wilkowska', 'user', NULL);

-- UCZNIOWIE (7)
SELECT create_rzepka_user('rgalon@rzepka.pl', 'RoksanaG@121', 'Roksana', 'Galon', 'apprentice', NULL);
SELECT create_rzepka_user('klecko@rzepka.pl', 'KingaL@121', 'Kinga', 'Lecko', 'apprentice', NULL);
SELECT create_rzepka_user('fkasza@rzepka.pl', 'FilipK@121', 'Filip', 'Kasza', 'apprentice', NULL);
SELECT create_rzepka_user('jkotkiewicz@rzepka.pl', 'JuliaK@121', 'Julia', 'Kotkiewicz', 'apprentice', NULL);
SELECT create_rzepka_user('jstanczyk-mucha@rzepka.pl', 'JuliaS@121', 'Julia', 'Stańczyk-Mucha', 'apprentice', NULL);
SELECT create_rzepka_user('wrzesniowiecka@rzepka.pl', 'WiktoriaR@121', 'Wiktoria', 'Rześniowiecka', 'apprentice', NULL);
SELECT create_rzepka_user('lprzychodna@rzepka.pl', 'LidiaP@121', 'Lidia', 'Przychodna', 'apprentice', NULL);

-- Sprzątanie
DROP FUNCTION create_rzepka_user;
