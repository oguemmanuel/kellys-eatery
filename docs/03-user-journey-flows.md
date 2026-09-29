# 03 - User Journey Flows

## Customer (regular order)
1. Scans the Kelly's Eatery QR.
2. Lands on the **kitchen intro page**: story, hours, how it works, contact.
3. Taps **See today's menu**.
4. Browses categories, opens a dish, picks the required choices (for example swallow and goat or cow for soups), optionally adds extras (plantain, salad, turkey, chicken, fish), then adds to cart.
5. Checkout: name, phone, delivery address and landmark. Nothing else.
6. Sees the total (no delivery fee).
7. Places order; gets order number, "Awaiting payment", 30 minute payment window.
8. Taps **Send order on WhatsApp**; prefilled message opens.
9. Owner shares payment details on WhatsApp and arranges the delivery rider there; the customer pays the rider directly.
10. Customer pays; owner marks Paid; status moves Preparing > Ready > Out for delivery > Completed.

## Customer (bulk order)
1. From the intro page (or menu header) taps **Bulk orders**.
2. Lands on the **Bulk Order page**: items the owner has listed, each with unit and price (e.g. "Groundnut soup, per bowl, GHS X"). Only dishes the owner has switched on for bulk appear.
3. Chooses quantity per item (number of bowls), sees the running total.
4. Continues to bulk checkout: name, phone, **delivery date and time** (the picker only allows times at least 24 hours ahead, no message shown), delivery address and landmark.
5. Places order; status "Awaiting payment", 24 hour payment window.
6. Taps **Send order on WhatsApp**; owner confirms availability of the slot, shares payment details and arranges the rider.
7. Customer pays the listed total; owner marks Paid; the order is prepared for the chosen date.

Edge cases:
- Dish sold out while in cart: it is flagged and must be removed before checkout.
- Bulk item removed or switched off while in cart: warning at checkout.
- Kitchen closed: intro and menu viewable; regular ordering disabled; bulk orders still allowed for a later date.
- Payment not received in time: order auto-cancels; customer can reorder.
- Earlier times are simply not selectable in the bulk date picker.
- Customer tries to mix regular and bulk items: prompt to check out one, then the other.

## Owner/Admin
1. Logs in on phone; new order appears with sound/highlight as **Awaiting payment**.
2. Taps the customer's phone to open WhatsApp; shares payment details and arranges the rider.
3. After payment, taps **Mark as paid**.
4. Moves status: Preparing > Ready > Out for delivery > Completed.
5. Checks the **Bulk** tab (sorted by delivery date) to plan cooking.
6. **Menu tab:** flips availability, edits regular dishes. On the **Choices** screen, switches individual swallows or meats on or off for the day (for example Amala off when finished).
7. **Bulk tab (Bulk manager):** sees every dish from the menu already listed, sets the **bulk price and unit** (e.g. per bowl) for each, and switches on only the ones available for bulk. Taps **Add extra dish** for any dish that is not on the menu yet.
8. **Reports tab:** today's and this month's revenue, orders count, average order value, daily and monthly charts, best-selling dishes (filter: today, 7 days, this month, all time).
9. Settings: hours, open/closed, bulk notice period, WhatsApp number, QR download.

## Staff (optional)
Orders screen only: advance status on paid orders. No Mark as paid, prices, bulk pricing, reports or settings.

## First-time Setup
Create owner account > add kitchen info and story > add categories and dishes with photos > open the Bulk manager, set bulk price and unit for the dishes to offer and switch them on > set hours > download QR > put it on flyers and socials.
