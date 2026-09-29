# 06 - Roadmap After MVP

| Phase | Timing | Scope |
|---|---|---|
| 1 | Weeks 1-4 | MVP (see 07-MVP.md): intro page, menu, bulk order page (by the bowl), WhatsApp payment, admin, reports |
| 2 | When volume grows | **Paystack** (MoMo and card), automatic payment confirmation via webhook, receipts |
| 3 | When bike/car is ready | **Kitchen delivery:** switch on delivery fee (flat or by area), rider assignment, delivery status |
| 4 | After that | Automatic WhatsApp/SMS status updates, paid option upgrades, promo codes |
| 5 | Later | Customer history and repeat orders, loyalty, expense tracking and profit view, CSV export |

Paystack migration: add a `payments` module that creates the transaction and handles the webhook, set `paymentMethod = PAYSTACK`, keep "Send on WhatsApp" as a support button. The payment gate stays the same.

Delivery migration: the `deliveryFee` field already exists; enable it in settings, show the fee at checkout, and add delivery zones when needed.

Move to Phase 2 when manual payment confirmation becomes the owner's bottleneck.
