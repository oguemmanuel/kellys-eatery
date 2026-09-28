# 07 - MVP (START HERE)

Files 01 to 06 are the long-term plan. Build from this file only.

## Goal
Live in about 4 weeks: customers scan the QR, meet Kelly's Eatery, then order dishes for delivery, or place a bulk order by the bowl for a chosen date, and pay via WhatsApp before cooking starts. The owner manages dishes, bulk prices, payments and orders and sees sales from a phone.

## In Scope
- **Intro page** as QR landing (brand, story, how it works, hours, contact) with **See today's menu** and **Bulk orders** buttons
- Menu with categories, photos, prices, sold-out state
- **Dish choices and extras:** required choices (swallow, goat or cow), add-on extras, and a Choices manager to switch options on or off
- Seed script with Kelly's actual menu (`prisma/seed.ts`, see 08-menu-seed.md)
- Regular checkout: name, phone, delivery address and landmark (no notes, no scheduling, no explanatory messages)
- **Bulk Order page and checkout:** owner-listed bulk items sold per bowl/tray at owner-set prices, quantity picker, delivery date at least 24 hours ahead (earlier times not selectable, no notice message), delivery only
- Delivery only for now, no delivery fee (rider arranged on WhatsApp, customer pays the rider); no pickup
- Order created as AWAITING_PAYMENT, confirmation page with prefilled WhatsApp button, status page
- Admin login (Supabase Auth), menu CRUD, availability toggles
- **Admin Bulk manager:** every dish listed automatically, set bulk price and unit, switch dishes on or off, **Add extra dish** button
- Admin orders with tabs (incl. Bulk): **Mark as paid**, then Preparing > Ready > Out for delivery > Completed
- Server-side payment gate; auto-cancel unpaid orders (30 min ordinary, 24 h bulk)
- **Admin reports:** daily revenue, monthly revenue, orders count, average order value, best-selling dishes with range filter
- Open/closed switch, bulk notice setting, QR download
- Kelly's Eatery branding (green, orange, cream), Vercel deploy, custom domain

## Not in MVP
Paystack, delivery fees and kitchen-run delivery, automatic WhatsApp/SMS, promo codes, expenses/profit, mixed regular and bulk carts, pickup, order notes, scheduling regular orders, dine-in.

## Build Plan
**Week 1: Foundation and public site**
- Next.js + Tailwind + Prisma + Supabase, schema migrated, brand tokens set
- Run `prisma/seed.ts`: kitchen, categories, Kelly's dishes, swallow and meat choices (all dishes appear in the Bulk manager, off until priced)
- Intro page, menu page, dish sheet, cart state

**Week 2: Ordering**
- Dish sheet with required choices and extras, price calculation
- Regular checkout (name, phone, delivery address)
- Bulk Order page, quantity picker, bulk checkout
- `POST /api/orders` with server pricing and all validation rules (availability, bulk rules, closed state)
- Order page with prefilled WhatsApp link and status steps

**Week 3: Admin**
- Admin login, orders tabs, Mark as paid, guarded status changes
- Menu manager, Bulk manager (with Add extra dish) and Choices manager, image upload
- Auto-expiry cron, realtime or polling, alert sound

**Week 4: Reports and launch**
- Reports page: revenue cards, daily and monthly charts, best sellers with range filter
- Settings screen, QR generation and print-ready download
- Test on real Android and iPhone, slow network; test reports against sample paid orders
- Enter real menu, bulk items, prices and photos with the client, train the owner, deploy, connect domain

## Definition of Done
- Scanning the QR opens the intro page with clear paths to the menu and to bulk orders.
- Marking a dish sold out updates the customer menu within seconds.
- Every dish appears in the Bulk manager; the owner sets a bulk price and unit, switches it on, and it appears on the Bulk Order page. Extra dishes can be added from the same screen.
- A soup cannot be ordered without a swallow (and goat or cow where applicable); a choice switched off in admin disappears from the customer's dish sheet.
- A bulk order enforces 24 hour notice and the owner-set price (no minimum quantity).
- An order shows "Awaiting payment", opens WhatsApp with the correct prefilled message, and cannot move to Preparing until marked Paid.
- Unpaid ordinary orders cancel after 30 minutes.
- Reports show correct daily and monthly revenue (paid orders only) and rank best-selling dishes.
- The client runs a full day from their phone without help.
