# Kelly's Eatery

Online ordering site for Kelly's Eatery: customers scan a QR code, see today's menu, order for delivery or in bulk, and pay on WhatsApp. The product spec lives in [`docs/`](docs/); build from [`docs/07-MVP.md`](docs/07-MVP.md).

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
- `/admin` orders in tabs (Awaiting payment, Bulk to deliver, Done). The food is cooked before it is listed, so Mark as paid finishes the order; paid bulk orders stay under Bulk to deliver until their day. Only unpaid orders can be cancelled. The list refreshes every 10 seconds and plays a chime for a new order
- Open and closed switch in the header
- `/admin/menu` sold-out toggles, add and edit dishes with a photo (shrunk to about 200KB WebP), remove a dish
- `/admin/bulk` (owner only) bulk price and unit per dish, bulk on and off, and Add extra dish for bulk-only dishes
- `/admin/choices` choice groups (swallow, meat), sold-out toggles per option, prices, which dishes use each group, and whether a group shows for bulk
- `/api/cron/expire-orders` cancels unpaid orders past their window; the admin also runs it whenever orders load

MVP week 4 (owner only):

- `/admin/reports` today's and this month's revenue, orders today, average order value, daily revenue for 7 or 30 days, monthly revenue for 12 months, and the top 10 best sellers (Today, 7 days, This month, All time) tagged Regular or Bulk. Revenue counts paid orders that were not cancelled, by the day they were paid in Accra time
- `/admin/settings` open switch, opening hours, WhatsApp and call numbers, bulk notice hours, the intro page story, and sign out
- QR code for the intro page as a PNG (2048px) or SVG download, plus `/admin/poster`, an A4 poster to print or save as PDF

Before printing the QR code, set `NEXT_PUBLIC_SITE_URL` to the live domain. The settings screen warns while it is not set or points at a local address.

## Launch checklist

These need Kelly or the domain owner and are not code:

1. Create the Supabase project, run `npx prisma migrate deploy`, then `npm run db:seed`.
2. Import the repo in Vercel, add every value from `.env.example`, and deploy.
3. Connect the domain in Vercel and set `NEXT_PUBLIC_SITE_URL` to it.
4. Sign in as Kelly, enter the real menu, prices, bulk prices and photos, and check the settings.
5. Place a test order on a real Android phone and an iPhone, mark it paid, and walk it to Delivered.
6. Print the poster from Settings.

The logo and hero photo in `public/brand/` are cropped from the flyer. Swap them for the original files when available.
