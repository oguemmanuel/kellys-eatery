# Kelly's Eatery

Online ordering site for Kelly's Eatery: customers scan a QR code, see today's menu, order for delivery or in bulk, and pay on WhatsApp before cooking starts. The product spec lives in [`docs/`](docs/); build from [`docs/07-MVP.md`](docs/07-MVP.md).

Stack: Next.js (App Router) + Tailwind CSS + Prisma + Supabase Postgres, deployed on Vercel.

## Getting started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in the Supabase connection strings (any Postgres works locally).
3. Create the tables: `npx prisma migrate dev`
4. Load Kelly's menu: `npm run db:seed` (safe to run again; it skips what already exists)
5. Start the site: `npm run dev` and open http://localhost:3000

### Admin setup (Supabase)

1. In the Supabase dashboard, open Project Settings, API, and copy the project URL, the anon key and the service role key into `.env` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
2. In Authentication, Users, choose Add user and create Kelly's login with an email and password. Turn off public sign-ups under Authentication, Providers, Email.
3. Put that email in `OWNER_EMAILS`. The first sign-in makes it an owner. Kitchen staff get a row in the `AdminUser` table with the role `STAFF`.
4. Set `CRON_SECRET` to a long random string, and add the same value in Vercel. Vercel calls `/api/cron/expire-orders` once a day (`vercel.json`).
5. Dish photos go to a public storage bucket named `dishes`, created on the first upload.

Sign in at `/admin/login`.

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
- Unpaid orders are cancelled once their payment window passes (30 minutes, or 24 hours for bulk) when the order is next viewed.

MVP week 3 (owner admin, phone first):

- `/admin/login` email and password sign-in through Supabase Auth; every `/admin` page checks for an admin account
- `/admin` orders in tabs (Awaiting payment, Cooking, Bulk, Ready, Done), Mark as paid, then Start cooking, Ready, Out for delivery and Delivered; cooking cannot start before payment. The list refreshes every 10 seconds and plays a chime for a new order
- Open and closed switch in the header
- `/admin/menu` sold-out toggles, add and edit dishes with a photo (shrunk to about 200KB WebP), remove a dish
- `/admin/bulk` (owner only) bulk price and unit per dish, bulk on and off, and Add extra dish for bulk-only dishes
- `/admin/choices` choice groups (swallow, meat), sold-out toggles per option, prices, which dishes use each group, and whether a group shows for bulk
- `/api/cron/expire-orders` cancels unpaid orders past their window; the admin also runs it whenever orders load

The logo and hero photo in `public/brand/` are cropped from the flyer. Swap them for the original files when available.
