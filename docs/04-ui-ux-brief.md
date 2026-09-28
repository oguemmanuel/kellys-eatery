# 04 - UI/UX Brief: Kelly's Eatery

## Brand (from the flyer)
- Name: **Kelly's Eatery**. Logo: chef hat and fork mark, bold green script wordmark.
- Taglines: "Good life is Good food!" and "Treat yourself to a good meal today!"
- Colours: deep forest green (primary), warm orange/amber (accent), cream background, white cards. Confirm exact hex from the client's logo files.
- Type: heavy rounded display font for headings, casual script only for short taglines, clean sans for body (Poppins or similar).
- Imagery: warm close-up food photography on cream; leaf, tomato and pepper accents.
- Contact: Calling and WhatsApp +233 592 569 298.

## Principles
Mobile first, fast, appetising, minimal taps. Payment steps must be obvious and unavoidable. Regular and bulk ordering feel like two clear paths.

## Customer Screens
1. **Intro (home):** logo, tagline, hero dish photo, short story, "How it works" (Pick > Order > Pay on WhatsApp > We deliver), hours and open/closed badge, two big buttons: **See today's menu** (primary) and **Bulk orders** (secondary, orange), WhatsApp/call links.
2. **Menu:** sticky category chips, dish cards (photo, name, price, Add). Sold out dishes greyed with "Sold out today". A "Bulk orders" banner links to `/bulk`.
3. **Dish sheet:** photo, description, **required choices** as chips (Swallow: Eba, Pounded yam, Fufu...; Meat: Goat, Cow) with unavailable choices greyed, an **Add extras** checklist with prices (Plantain +GHS 15, Salad +15, Turkey +35...), quantity, live price, Add to cart (disabled until required choices are picked).
4. **Cart bar:** fixed bottom "3 items - GHS 85.00 - View cart".
5. **Checkout (regular):** name, phone, delivery address and landmark, order summary and total, **Place order**. No notes, no scheduling, no explanatory messages.
6. **Bulk Order page:** heading "Bulk orders", short explainer ("Order by the bowl for events, family and offices."). Cards per bulk item: photo, name, **unit** (e.g. per bowl), **price**, quantity stepper. Sticky bar with total and Continue.
7. **Bulk checkout:** delivery date and time picker (times earlier than 24 hours ahead are simply not selectable, no message), name, phone, delivery address and landmark, order summary, **Place order**. No notes, no notices.
8. **Order page:** order number, status steps, delivery date and time (bulk orders), "Bulk" badge, green **Send order on WhatsApp to pay** button while unpaid, payment window countdown.

## Admin Screens
1. **Orders:** tabs Awaiting payment / Paid and cooking / Bulk / Ready / Done. Card shows items, total, phone (tap to WhatsApp), delivery address, bulk delivery time, bulk badge. **Mark as paid** is the main button on unpaid orders; later status buttons disabled until paid.
2. **Menu manager:** regular dishes with availability switch, search, add.
3. **Bulk manager:** every dish is listed automatically with a thumbnail. Each row has an inline-editable **bulk price** and **unit** and an availability switch ("Available for bulk"), off until a price is set. A prominent **Add extra dish** button at the top (form includes a checkbox "Also show on the regular menu"). Search and filter (All, On, Off). Hint: "Set the price first, then switch the dish on."
4. **Dish form:** image, name, description, price, category; separate section for bulk price and unit (bowl, tray, pack).
5. **Reports:**
   - Top cards: Today's revenue, This month's revenue, Orders today, Average order value.
   - Daily revenue bar chart (7 or 30 days) and monthly revenue chart (6 to 12 months).
   - **Best sellers:** dish, quantity sold, revenue, Regular/Bulk tag, range filter (Today, 7 days, This month, All time).
   - Note: "Revenue counts paid orders only."
6. **Choices:** groups (Swallow, Meat, Jollof meat) with each option and an on/off switch; add or rename options and set an optional extra price per option; choose which dishes use which group.
7. **Settings:** story, hours, open/closed, bulk notice period, WhatsApp number, QR download.

## Copy Rules
- Warm and short: "Fresh today", "Sold out today", "Awaiting payment", "Payment confirmed, we are cooking".
- Prices as "GHS 25.00"; bulk as "GHS 120.00 per bowl".
- Buttons are verbs: See today's menu, Add, Order in bulk, Place order, Send on WhatsApp, Mark as paid.

## Accessibility
44px+ tap targets, AA contrast (check orange on cream), alt text, works at 360px width, charts have text summaries.
