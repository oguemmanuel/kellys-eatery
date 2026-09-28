# 02 - Technical Requirements

## Stack
- Next.js (App Router) + React + Tailwind CSS
- Prisma + Supabase Postgres
- Supabase Auth (admin only), Supabase Storage (dish images)
- Vercel hosting (plus Vercel Cron for order expiry)
- QR generation: `qrcode` package (static PNG/SVG pointing to the site root)
- Charts in admin: Recharts (or plain SVG bars to keep it light)
- Payments now: WhatsApp deep link (`https://wa.me/233592569298?text=...`) plus manual "Mark as paid"
- Payments phase 2: Paystack (initialize transaction, webhook to confirm)
- Timezone: Africa/Accra for all scheduling and reports

## Architecture
Single Next.js app: public customer routes, protected `/admin` routes, route handlers for the API. Home, menu and bulk pages are server-rendered with on-demand revalidation when admin changes availability, prices or content.

## Routes
| Route | Purpose |
|---|---|
| `/` | **Kitchen intro page** (QR target) with buttons to menu and bulk orders |
| `/menu` | Regular dishes by category |
| `/bulk` | **Bulk Order page**: owner-listed bulk items (per bowl/tray), quantity, event date |
| `/cart`, `/checkout` | Regular order flow (delivery, placed instantly) |
| `/bulk/checkout` | Bulk order checkout |
| `/order/[id]` | Confirmation, WhatsApp payment button, live status |
| `/admin/login` | Owner login |
| `/admin` | Live orders (tabs: Awaiting payment, Paid and cooking, Bulk, Ready, Done) |
| `/admin/menu` | Manage regular dishes and categories |
| `/admin/bulk` | **Bulk manager**: all dishes listed, set bulk price and unit, availability toggle, add extra dishes |
| `/admin/choices` | **Choices manager**: swallow and meat options, switch each on or off for the day |
| `/admin/reports` | Daily and monthly revenue, best sellers |
| `/admin/settings` | Kitchen info, hours, bulk notice period, WhatsApp number, QR download |

## API (route handlers)
- `GET /api/menu`, `GET /api/bulk-items`, `GET /api/kitchen` (public; dishes include their option groups with available options, and the Extras list)
- `POST /api/orders` create order (AWAITING_PAYMENT, server-side pricing and validation; accepts `isBulk`)
- `GET /api/orders/[id]` status
- `PATCH /api/admin/items/[id]` toggle availability, edit; `PATCH /api/admin/items/[id]/bulk` set bulk price, unit, bulk availability; `POST/PUT/DELETE /api/admin/items` (`bulkOnly: true` creates an extra bulk-only dish); `/api/admin/categories`
- `PATCH /api/admin/options/[id]` switch a choice on or off; `POST/PUT/DELETE /api/admin/options`, `/api/admin/option-groups`
- `PATCH /api/admin/orders/[id]/pay` mark as paid (records who and when)
- `PATCH /api/admin/orders/[id]/status` advance status (guarded)
- `GET /api/admin/reports?range=day|week|month|custom&from=&to=` revenue series, totals, best sellers
- `POST /api/payments/webhook` (phase 2, signature verified)
- `GET /api/cron/expire-orders` (Vercel Cron, secured with secret)

## Key Requirements
- **Payment gate:** server rejects any move to PREPARING, READY, OUT_FOR_DELIVERY or COMPLETED while `paymentStatus != PAID`.
- No delivery fee: `deliveryFee` stays 0 (field kept for later). Checkout shows no delivery or payment messages.
- Never trust client prices; recompute totals from DB.
- **Regular orders** (always instant, no scheduling) require `isAvailable = true`, `bulkOnly = false`, kitchen open.
- **Bulk orders:** `isBulk = true` on the order; every item must have `bulkEnabled = true`, a `bulkPrice` and `bulkUnit`, and not be archived; quantity at least 1 (no minimum); `scheduledFor >= now + bulkLeadHours` (24; the date picker simply disables earlier times, no notice message is shown). Line price is `bulkPrice`, never the regular price. No negotiation flow. A cart cannot mix bulk and regular items.
- Unpaid expiry: ordinary orders `unpaidExpiryMin` (30); bulk `bulkUnpaidExpiryHours` (24).
- **Dish choices:** a dish with required option groups cannot be added to cart or ordered without one available option per group; the server re-validates and rejects unavailable options. Line price = base + option price deltas, computed server-side.
- **Extras** are ordinary dishes with `isExtra = true`; the dish sheet offers them as add-ons and each becomes its own order line.
- **Reports:** revenue counts only `paymentStatus = PAID` and status not CANCELLED, bucketed by `paidAt` in Africa/Accra. Best sellers from `OrderItem` on those orders, ranked by quantity (also revenue), with a regular/bulk tag. Use SQL aggregation.
- Admin protected by middleware and role check; reports and bulk pricing OWNER only. A dish cannot be switched on for bulk without a bulk price and unit.
- New dishes added to the regular menu appear in the Bulk manager automatically (bulk off until priced).
- Rate limit `POST /api/orders`; honeypot field.
- Images compressed on upload (WebP, about 200KB max).
- Admin live updates: Supabase Realtime on `Order` (10s polling fallback).
- Ghana phone validation, GHS currency, mobile 3G friendly.
- Payment logic in a `payments` module so Paystack can replace manual confirmation cleanly.
