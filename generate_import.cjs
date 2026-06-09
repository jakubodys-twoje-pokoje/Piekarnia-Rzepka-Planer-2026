#!/usr/bin/env node
// Jednorazowy generator SQL — przetwarza CSV zamówień i tworzy skrypt importu
// Uruchom: node generate_import.js

const fs = require('fs');

const CSV_PATH  = '/root/.claude/uploads/22338530-a9f9-5503-9995-7e59e1501b43/0d7d0a79-ZAM_WIENIA_DLA_PIEKARNIA_RZEPKA__DASHBOARD.csv';
const OUT_PATH  = '/home/user/Piekarnia-Rzepka-Planer-2026/import_czerwiec_2026.sql';

// ── CSV parser (obsługuje pola w cudzysłowach z przecinkami wewnątrz) ─────────
function parseCSVLine(line) {
  const result = [];
  let cur = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  result.push(cur.trim());
  return result;
}

// ── Mapowanie dat: VI 2025 → VI 2026 (układ tygodni identyczny, przesunięcie -1 dzień) ──
function mapDate(dateStr) {
  const [d, m, y] = dateStr.split('.').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  dt.setFullYear(2026);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

// ── Wczytaj CSV ───────────────────────────────────────────────────────────────
const lines = fs.readFileSync(CSV_PATH, 'utf8').split('\n');

// Znajdź wiersz nagłówków (ten z "NAZWA")
let headerIdx = lines.findIndex(l => l.trimStart().startsWith('NAZWA'));
if (headerIdx < 0) throw new Error('Nie znaleziono wiersza NAZWA w CSV');

const headers = parseCSVLine(lines[headerIdx]);

// Kolumny dat (pomijamy NAZWA, KOD i SUMA)
const dateCols = [];
for (let i = 2; i < headers.length; i++) {
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(headers[i])) {
    dateCols.push({ idx: i, newDate: mapDate(headers[i]) });
  }
}

// ── Parsuj wiersze produktów (pomijamy wiersz z nazwami dni tygodnia) ─────────
const rows = []; // { code, name, date, qty }

for (let i = headerIdx + 2; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const cols = parseCSVLine(line);
  const name = cols[0]?.trim();
  const code = cols[1]?.trim() || '';

  if (!name || name === 'INNE' || name === 'NAZWA') continue;

  for (const dc of dateCols) {
    const raw = cols[dc.idx]?.trim();
    if (!raw) continue;
    const num = parseFloat(raw.replace(',', '.'));
    if (isNaN(num) || num <= 0) continue;
    const qty = Math.round(num);
    if (qty <= 0) continue;

    rows.push({
      code: code.replace(/'/g, "''"),
      name: name.replace(/'/g, "''"),
      date: dc.newDate,
      qty
    });
  }
}

const uniqueDates = [...new Set(rows.map(r => r.date))].sort();

// ── Generuj SQL ───────────────────────────────────────────────────────────────
let sql = `-- ═══════════════════════════════════════════════════════════════
-- IMPORT ZAMÓWIEŃ: PLAC POCZTOWY — CZERWIEC 2026
-- Źródło: ZAM_WIENIA_DLA_PIEKARNIA_RZEPKA__DASHBOARD.csv (VI 2025)
-- Daty przesunięte z VI/V 2025 na VI/V 2026 (ten sam układ tygodni).
--
-- INSTRUKCJA:
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Wklej całą zawartość tego pliku
--   3. Kliknij Run
--   4. Sprawdź wynik w sekcji "WERYFIKACJA" na dole
--
-- Jeśli Twoja lokalizacja ma inną nazwę niż "PLAC POCZTOWY",
-- zmień ją w linii: WHERE name ILIKE '%PLAC POCZTOWY%'
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. DANE Z CSV ─────────────────────────────────────────────
CREATE TEMP TABLE import_orders (
  code          TEXT,
  name          TEXT,
  delivery_date DATE,
  qty           INTEGER
);

INSERT INTO import_orders (code, name, delivery_date, qty) VALUES
`;

sql += rows.map(r => `  ('${r.code}', '${r.name}', '${r.date}', ${r.qty})`).join(',\n') + ';\n';

sql += `
-- ── 2. IMPORT DO BAZY ─────────────────────────────────────────
DO $$
DECLARE
  v_loc  UUID;
  v_user UUID;
  v_ord  UUID;
  v_date DATE;
  v_cnt  INTEGER;
BEGIN
  -- Znajdź lokalizację (zmień '%PLAC POCZTOWY%' jeśli inna nazwa)
  SELECT id INTO v_loc
  FROM locations
  WHERE name ILIKE '%PLAC POCZTOWY%'
  LIMIT 1;

  IF v_loc IS NULL THEN
    RAISE EXCEPTION 'Nie znaleziono lokalizacji PLAC POCZTOWY. Dostępne: %',
      (SELECT string_agg(name, ', ') FROM locations);
  END IF;

  SELECT id INTO v_user FROM profiles WHERE role = 'admin' LIMIT 1;
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Nie znaleziono użytkownika admin w profiles.';
  END IF;

  -- Utwórz jedno zamówienie na każdy dzień dostawy
  FOR v_date IN
    SELECT DISTINCT delivery_date FROM import_orders ORDER BY delivery_date
  LOOP
    INSERT INTO orders (location_id, user_id, order_date, delivery_date, status)
    VALUES (v_loc, v_user, v_date, v_date, 'completed')
    RETURNING id INTO v_ord;

    -- Dodaj pozycje: dopasowanie po kodzie+nazwie, potem samym kodzie, potem samej nazwie
    INSERT INTO order_items (order_id, product_id, quantity)
    SELECT
      v_ord,
      COALESCE(
        (SELECT id FROM inventory
         WHERE code = io.code AND name ILIKE io.name LIMIT 1),
        (SELECT id FROM inventory
         WHERE code = io.code AND io.code <> '' LIMIT 1),
        (SELECT id FROM inventory
         WHERE name ILIKE io.name LIMIT 1)
      ) AS product_id,
      io.qty
    FROM import_orders io
    WHERE io.delivery_date = v_date
      AND io.qty > 0
      AND COALESCE(
        (SELECT id FROM inventory
         WHERE code = io.code AND name ILIKE io.name LIMIT 1),
        (SELECT id FROM inventory
         WHERE code = io.code AND io.code <> '' LIMIT 1),
        (SELECT id FROM inventory
         WHERE name ILIKE io.name LIMIT 1)
      ) IS NOT NULL;

    GET DIAGNOSTICS v_cnt = ROW_COUNT;
    RAISE NOTICE 'Data %: dodano % pozycji', v_date, v_cnt;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '✓ Import zakończony! Zamówień: %',
    (SELECT COUNT(*) FROM orders
     WHERE location_id = v_loc
       AND delivery_date BETWEEN '2026-05-01' AND '2026-07-01');
  RAISE NOTICE '✓ Pozycji łącznie: %',
    (SELECT COUNT(*) FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE o.location_id = v_loc
       AND o.delivery_date BETWEEN '2026-05-01' AND '2026-07-01');
END $$;

COMMIT;

-- ── 3. WERYFIKACJA ────────────────────────────────────────────
-- Podsumowanie po dniach:
SELECT
  o.delivery_date          AS "Data dostawy",
  COUNT(DISTINCT oi.id)    AS "Produktów",
  SUM(oi.quantity)         AS "Suma szt.",
  o.status                 AS "Status"
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN locations   l  ON l.id = o.location_id
WHERE l.name ILIKE '%PLAC POCZTOWY%'
  AND o.delivery_date BETWEEN '2026-05-01' AND '2026-07-01'
GROUP BY o.delivery_date, o.status
ORDER BY o.delivery_date;

-- Produkty z CSV, których NIE znaleziono w inventory (do ręcznego sprawdzenia):
SELECT DISTINCT io.code AS "Kod", io.name AS "Nazwa z CSV"
FROM import_orders io
WHERE NOT EXISTS (
  SELECT 1 FROM inventory i
  WHERE (i.code = io.code AND i.name ILIKE io.name)
     OR (i.code = io.code AND io.code <> '')
     OR (i.name ILIKE io.name)
)
ORDER BY io.code, io.name;
`;

fs.writeFileSync(OUT_PATH, sql, 'utf8');

console.log(`✓ Wygenerowano: ${OUT_PATH}`);
console.log(`  Wierszy danych:    ${rows.length}`);
console.log(`  Unikalnych dat:    ${uniqueDates.length}`);
console.log(`  Zakres dat:        ${uniqueDates[0]} → ${uniqueDates[uniqueDates.length - 1]}`);
console.log(`  Unikalnych prod.:  ${new Set(rows.map(r => r.name)).size}`);
