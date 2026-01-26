# Instrukcja Przebudowy Bazy Danych - Piekarnia Rzepka

## Problem
Użytkownicy dodani bezpośrednio przez SQL nie mogą się zalogować (błąd 500).
Supabase Auth wymaga dodawania użytkowników przez Dashboard lub API.

## Kolejność działań

### 1. Uruchom główny skrypt czyszczący
1. Otwórz Supabase Dashboard > SQL Editor
2. Skopiuj całą zawartość pliku `database_rebuild.sql`
3. Uruchom (Run)
4. Poczekaj na komunikat "Success"

### 2. Dodaj lokalizacje
1. Edytuj plik `database_locations.sql` - wpisz swoje lokalizacje
2. Skopiuj zawartość do SQL Editor
3. Uruchom

### 3. Dodaj użytkowników przez Dashboard (WAŻNE!)

**NIE DODAWAJ UŻYTKOWNIKÓW PRZEZ SQL!**

Dla każdego użytkownika:
1. Supabase Dashboard > Authentication > Users
2. Kliknij "Add user" > "Create new user"
3. Wypełnij:
   - **Email**: email użytkownika
   - **Password**: wg wzoru `ImięX@121` (np. `JanK@121` dla Jana Kowalskiego)
   - **Auto Confirm User**: TAK (zaznacz)
   - **User Metadata** (kliknij "Show"): wpisz JSON:
     ```json
     {
       "first_name": "Jan",
       "last_name": "Kowalski",
       "role": "user"
     }
     ```
4. Kliknij "Create user"

### 4. Przypisz lokalizacje do użytkowników

Po dodaniu użytkowników, uruchom w SQL Editor:

```sql
-- Znajdź ID lokalizacji
SELECT id, name FROM public.locations;

-- Znajdź ID użytkowników
SELECT id, email, first_name, last_name FROM public.profiles;

-- Przypisz lokalizację do użytkownika
UPDATE public.profiles
SET default_location_id = 'UUID-LOKALIZACJI'
WHERE email = 'email@uzytkownika.pl';
```

### 5. Ustaw admina

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'email.admina@example.com';
```

## Format haseł

Wzór: `ImięX@121`
- Imię z wielkiej litery
- Pierwsza litera nazwiska (wielka)
- @121

Przykłady:
- Jan Kowalski → `JanK@121`
- Anna Nowak → `AnnaK@121`
- Piotr Wiśniewski → `PiotrW@121`

## Weryfikacja

Po zakończeniu sprawdź:
```sql
-- Lokalizacje
SELECT * FROM public.locations;

-- Użytkownicy z przypisanymi lokalizacjami
SELECT
  p.email,
  p.first_name,
  p.last_name,
  p.role,
  l.name as location_name
FROM public.profiles p
LEFT JOIN public.locations l ON p.default_location_id = l.id;
```

## Typowe problemy

### "User already exists"
Użytkownik z tym emailem już istnieje. Usuń go najpierw:
- Dashboard > Authentication > Users > znajdź > Delete

### Profile nie tworzy się automatycznie
Trigger nie zadziałał. Dodaj ręcznie:
```sql
INSERT INTO public.profiles (id, email, role, first_name, last_name)
SELECT id, email,
  raw_user_meta_data->>'role',
  raw_user_meta_data->>'first_name',
  raw_user_meta_data->>'last_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
```
