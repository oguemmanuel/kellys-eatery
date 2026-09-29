# Kelly's Eatery

Online ordering site for Kelly's Eatery: customers scan a QR code, see today's menu, order for delivery or in bulk, and pay on WhatsApp before cooking starts. The product spec lives in [`docs/`](docs/); build from [`docs/07-MVP.md`](docs/07-MVP.md).

Stack: Next.js (App Router) + Tailwind CSS + Prisma + Supabase Postgres, deployed on Vercel.

## Getting started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in the Supabase connection strings (any Postgres works locally).
3. Create the tables: `npx prisma migrate dev`
4. Load Kelly's menu: `npm run db:seed` (safe to run again; it skips what already exists)
5. Start the site: `npm run dev` and open http://localhost:3000

## What's built

MVP week 1:

- `/` kitchen intro page (QR landing) with the menu and bulk order buttons, open/closed badge, story, how it works, WhatsApp and call links
- `/menu` today's menu by category, sold-out dishes greyed, dish sheet with required choices (swallow, meat) and extras, live price
- `/cart` cart saved on the device, flags dishes or choices that sold out since they were added
- `/checkout` and `/bulk` are placeholders until week 2

The logo and hero photo in `public/brand/` are cropped from the flyer. Swap them for the original files when available.
