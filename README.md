# pridiction-market

Next.js + Auth.js + Prisma, mirroring the `Desktop/posters` setup:

- `next` 16.2.4, `react`/`react-dom` 19.2.4
- `next-auth` 5.0.0-beta.31 (Auth.js) with Google provider + Prisma adapter
- `prisma` 7.9.1 with `@prisma/adapter-pg`, generated client at `app/generated/prisma`
- pnpm workspace with the same `allowBuilds` entries as posters

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Fill in `.env`:

   - `DATABASE_URL` — Postgres connection string
   - `AUTH_SECRET` — already generated for local dev
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth credentials

3. Create the database and run migrations:

   ```bash
   pnpm exec prisma migrate dev --name init
   ```

4. Start the dev server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.
