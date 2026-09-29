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

MVP week 2:

- `/checkout` name, phone, delivery address and landmark; the order is placed as Awaiting payment
- `/bulk` dishes the owner switched on for bulk, priced per bowl or tray, with the meat choice; a separate cart from regular orders
- `/bulk/checkout` delivery date and time at least 24 hours ahead (8am to 8pm, every 30 minutes), then the same details
- `/order/[id]` order number, status steps, WhatsApp payment button with the order prefilled, payment countdown; refreshes every 15 seconds
- `POST /api/orders` recomputes every price from the database and enforces the rules in `docs/02-technical-requirements.md`; `GET /api/orders/[id]` returns the status
- Unpaid orders are cancelled once their payment window passes (30 minutes, or 24 hours for bulk) when the order is next viewed. The scheduled cleanup job comes with the admin in week 3.

The logo and hero photo in `public/brand/` are cropped from the flyer. Swap them for the original files when available.
