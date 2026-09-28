# 01 - Product Requirements: Kelly's Eatery Online Kitchen

## Vision
Kelly's Eatery is an online kitchen ("Good life is Good food!"). Customers scan a QR code (flyer, social, packaging), meet the kitchen, see available dishes, order now or ahead of time, or place a **bulk order** (by the bowl), and pay before the order is prepared. The owner controls availability, bulk pricing, orders and sees sales from a phone-friendly admin.

## Problem
- Menus shared as flyers or WhatsApp statuses go out of date; customers order dishes that are finished.
- Orders (especially bulk and advance orders) taken over WhatsApp/calls get mixed up and prices get negotiated case by case.
- The owner has no quick way to mark dishes sold out, and no view of daily or monthly sales or best sellers.

## Users
| User | Goal |
|---|---|
| Customer | Learn about the kitchen, see what is available, order now, for later, or in bulk, pay easily |
| Owner/Admin | Toggle availability, set bulk prices, confirm payments, manage orders, edit menu, track sales |
| Staff (optional) | View orders and update preparation/dispatch status |

## Business Rules
- Fulfilment: **delivery only** for now (no pickup, no dine-in).
- **Checkout stays minimal:** no notes field and no explanatory messages. The only prompt after ordering is the WhatsApp payment button.
- **No delivery fee on the site.** The kitchen has no bike or car yet. The rider is arranged on WhatsApp and the customer pays the rider directly. Kitchen-run delivery comes later.
- **Payment comes first.** No order is prepared or dispatched until payment is confirmed.
- Payment now: WhatsApp (owner shares payment details, confirms receipt, marks order Paid in admin). Payment later: Paystack when volume grows.
- **No scheduling for regular orders:** only dishes that are ready are marked available, so a regular order is placed for now. Only bulk orders have a chosen delivery date and time.
- **Bulk orders:** separate **Bulk Order page**. Bulk items are sold in large portions (for example a **bowl of soup**). Every dish on the menu is **automatically listed in the admin's Bulk manager**; the owner sets a **bulk price and unit** and switches on only the dishes available for bulk. The owner can also **add extra dishes** there. Customers pay the listed price, no negotiation. **No minimum quantity.** Needs 24 hours notice.
- A bulk order and a regular order are separate carts and separate orders (no mixing).
- Unpaid ordinary orders auto-cancel after **30 minutes**; bulk orders after **24 hours**.

## Core Features (MVP)
1. QR opens the **kitchen intro page** (brand, story, hours, how ordering works, contact) with two main buttons: **See today's menu** and **Bulk orders**.
2. Menu with categories, photos, GHS prices; sold-out dishes greyed. Dishes have required choices (swallow, goat or cow) and add-on extras (see 08-menu-seed.md).
3. Regular checkout: name, phone, delivery address and landmark. No notes, no scheduling, no explanatory messages.
4. **Bulk Order page** (`/bulk`): owner-listed bulk items with unit and price (e.g. "Groundnut soup, per bowl, GHS X"), quantity picker, delivery date and time, delivery address.
5. Order confirmation with order number and a "Send order on WhatsApp to pay" button (prefilled message).
6. Order status page: Awaiting payment > Paid > Preparing > Ready > Out for delivery > Completed.
7. Admin: login, menu CRUD, availability toggle, **Bulk manager** (all dishes listed automatically; set bulk price and unit, switch availability, add extra dishes), orders with tabs (incl. Bulk), Mark as paid, status updates, open/closed switch, new order alert.
8. **Admin reports:** daily revenue, monthly revenue, orders count, average order value, **best-selling dishes** (regular and bulk).

## Phase 2
- Paystack (MoMo and card) with automatic confirmation via webhook.
- Kitchen-run delivery (own bike/car) with delivery fee by area.
- Automatic WhatsApp/SMS status updates, promo codes, customer history.

## Out of Scope (for now)
Dine-in, multi-branch, loyalty points, inventory counts, live driver tracking, mixed regular and bulk carts.

## Success Metrics
- Intro and menu load under 2s on mobile data.
- Owner marks a dish sold out in under 5 seconds.
- 80%+ of orders start from the site instead of a manual chat.
- Zero orders prepared before payment is confirmed.
- Owner can answer "how much did we make this month and what sells best" in under 10 seconds.

## Open Questions
- What unit does each dish use in bulk (bowl, tray, pack) and what are the bulk prices? (The owner sets these in admin.)
