# Publish Gebna-A on your own domain

This is a **Next.js 16 (App Router) + PostgreSQL (Drizzle)** app. To publish it with any domain you need two free things: a **host** (Vercel) and a **database** (Neon / Supabase / Vercel Postgres).

## 1. Create a free database
- Go to [neon.tech](https://neon.tech) → New project → copy the connection string.
- It looks like `postgresql://user:pass@ep-....neon.tech/neondb?sslmode=require`.

## 2. Set environment variables
Copy `.env.example` to `.env` locally, and also add the same keys in **Vercel → Settings → Environment Variables**:

```
DATABASE_URL=<your Neon connection string>
ADMIN_EMAIL=nedal2turk@gmail.com
ADMIN_PHONE=05510669847
ADMIN_PASSWORD=<choose a strong password>
BUSINESS_EMAIL=gebna.a25@gmail.com
GMAIL_USER=gebna.a25@gmail.com
GMAIL_APP_PASSWORD=<generate at myaccount.google.com/apppasswords>
```

`GMAIL_APP_PASSWORD` is optional — without it orders still save to the database and show in the admin dashboard; with it, the owner and customer also get Gmail notifications.

## 3. Initialize the database schema + catalog
Run once, pointing at your remote DB:

```bash
DATABASE_URL="<your Neon connection string>" npx drizzle-kit push
DATABASE_URL="<your Neon connection string>" npx tsx src/db/seed.ts
```

This creates all tables and seeds the 8 artisan cheeses + the owner account.

## 4. Deploy to Vercel (any domain)
**Option A — GitHub (recommended):** push this repo to GitHub → [vercel.com/new](https://vercel.com/new) → import it → paste the env vars → Deploy. Vercel auto-detects Next.js (`vercel.json` is already configured).

**Option B — CLI:** `npm i -g vercel` → `vercel --prod` (set `VERCEL_TOKEN` for CI).

## 5. Attach your domain
In the Vercel project → **Settings → Domains** → add e.g. `gebna-a.app` → Vercel gives you DNS records (usually a single `A` / `CNAME`) → add them at your domain registrar. HTTPS is automatic. Your site is now live at `https://gebna-a.app`.

## Notes
- The owner logs in at `/admin` with `ADMIN_EMAIL` + `ADMIN_PHONE` + `ADMIN_PASSWORD`.
- The PWA install, iOS `.mobileconfig`, and Android install all derive the correct URLs from whichever domain you deploy on — no extra config needed.
- To update data later (new products, etc.) just use the admin dashboard; no redeploy required.
