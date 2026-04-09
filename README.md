# ROD Promyk

Aplikacja web dla ROD „Promyk” (Next.js + PostgreSQL + Prisma + NextAuth).

## Szybki start

1. Skopiuj `.env.example` do `.env` i uzupełnij:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL`
2. Zainstaluj pakiety:

```bash
npm install
```

3. Uruchom migracje i seed:

```bash
npm run db:migrate
npm run db:seed
```

4. Start:

```bash
npm run dev
```

## Skrypty bazy danych

- `npm run db:migrate` – migracje lokalne (tworzenie kolejnych migracji).
- `npm run db:deploy` – **produkcja/CI**, stosuje gotowe migracje.
- `npm run db:sync` – awaryjne `db push` (tylko lokalnie, nie do produkcji).
- `npm run db:seed` – dane startowe.
- `npm run db:studio` – podgląd danych.

## Migracje Prisma (produkcja)

Repo zawiera migrację startową: `prisma/migrations/202604090001_init`.

W CI / Vercel używaj:

```bash
npm run db:deploy
```

### Jeśli baza już istnieje i była tworzona bez Prisma Migrate

Po dodaniu migracji należy raz zrobić baseline:

```bash
npx prisma migrate resolve --applied 202604090001_init
```

Potem standardowo:

```bash
npm run db:deploy
```

## Upload galerii (Vercel Blob)

Ustaw zmienną środowiskową:

- `BLOB_READ_WRITE_TOKEN`

Po tym panel admina (`/panel/admin/galeria`) umożliwia wysyłanie plików bezpośrednio do Blob.

## Upload dokumentów (Vercel Blob)

Panel admina (`/panel/admin/dokumenty`) obsługuje:

- upload plików regulaminów/statutu do Blob,
- publikację samej treści (markdown) bez pliku,
- usuwanie dokumentu (z próbą usunięcia pliku z Blob).

## Powiadomienia e-mail (Resend)

Opcjonalnie ustaw:

- `RESEND_API_KEY`
- `RESEND_FROM`

Wtedy nowe wiadomości czatu wysyłają mailowe powiadomienie.
Szablony e-mail są brandowane (kolory/logotyp/CTA) i gotowe pod dalsze rozszerzenia.
