# 05 - Database Schema (Prisma)

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum OrderType { DELIVERY PICKUP }        // only DELIVERY is used for now
enum OrderStatus {
  AWAITING_PAYMENT
  PAID
  PREPARING
  READY
  OUT_FOR_DELIVERY
  COMPLETED
  CANCELLED
}
enum PaymentStatus { UNPAID PAID FAILED REFUNDED }
enum PaymentMethod { WHATSAPP_MANUAL PAYSTACK }
enum Role { OWNER STAFF }

model Kitchen {
  id                     String   @id @default(cuid())
  name                   String   @default("Kelly's Eatery")
  tagline                String?
  story                  String?
  logoUrl                String?
  heroImageUrl           String?
  phone                  String                      // 233592569298
  whatsapp               String                      // 233592569298
  isOpen                 Boolean  @default(true)
  openingHours           Json?
  deliveryFee            Decimal  @default(0) @db.Decimal(10,2)  // 0 for now; used when kitchen gets a bike/car
  unpaidExpiryMin        Int      @default(30)        // ordinary orders
  bulkUnpaidExpiryHours  Int      @default(24)        // bulk orders
  bulkLeadHours          Int      @default(24)
}

model AdminUser {
  id        String   @id                              // Supabase auth user id
  email     String   @unique
  role      Role     @default(OWNER)
  createdAt DateTime @default(now())
}

model Category {
  id        String     @id @default(cuid())
  name      String
  sortOrder Int        @default(0)
  items     MenuItem[]
}

// One table for all dishes. Every dish can also be offered in bulk.
// Regular menu shows bulkOnly = false. Bulk page shows bulkEnabled = true.
model MenuItem {
  id            String   @id @default(cuid())
  categoryId    String?
  name          String
  description   String?
  price         Decimal? @db.Decimal(10,2)               // regular price; may be empty for bulkOnly dishes
  imageUrl      String?
  isAvailable   Boolean  @default(true)                  // regular: available today
  bulkEnabled   Boolean  @default(false)                 // owner switch: available for bulk orders
  bulkPrice     Decimal? @db.Decimal(10,2)               // owner-set price per unit; required to enable bulk
  bulkUnit      String?                                  // "bowl", "tray", "pack"
  bulkOnly      Boolean  @default(false)                 // extra dish added in Bulk manager, hidden from regular menu
  isExtra       Boolean  @default(false)                 // add-on (Plantain, Salad, Turkey...): offered on other dishes and orderable alone
  isArchived    Boolean  @default(false)
  sortOrder     Int      @default(0)
  category      Category? @relation(fields: [categoryId], references: [id])
  orderItems    OrderItem[]
  optionGroups  MenuItemOptionGroup[]
  updatedAt     DateTime @updatedAt

  @@index([bulkEnabled])
  @@index([categoryId, isAvailable])
}

// Dish choices, e.g. group "Swallow" (Eba, Pounded yam...) or "Meat" (Goat, Cow).
// Groups are shared across dishes, so the owner can switch one option off for all dishes at once.
model OptionGroup {
  id          String   @id @default(cuid())
  name        String                            // "Swallow", "Meat"
  isRequired  Boolean  @default(true)           // customer must pick exactly one
  showInBulk  Boolean  @default(false)          // shown on bulk orders (Meat yes, Swallow no)
  sortOrder   Int      @default(0)
  options     Option[]
  items       MenuItemOptionGroup[]
}

model Option {
  id          String   @id @default(cuid())
  groupId     String
  name        String
  priceDelta  Decimal  @default(0) @db.Decimal(10,2)   // 0 for now; allows paid upgrades later
  isAvailable Boolean  @default(true)                  // owner switch per day
  sortOrder   Int      @default(0)
  group       OptionGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@index([groupId])
}

model MenuItemOptionGroup {
  menuItemId  String
  groupId     String
  menuItem    MenuItem    @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  group       OptionGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@id([menuItemId, groupId])
}

model Order {
  id              String        @id @default(cuid())
  number          Int           @default(autoincrement())
  customerName    String
  phone           String
  type            OrderType     @default(DELIVERY)
  address         String?                       // required (delivery only for now)
  landmark        String?
  scheduledFor    DateTime?                     // bulk orders only: chosen delivery date and time
  isBulk          Boolean       @default(false)
  subtotal        Decimal       @db.Decimal(10,2)
  deliveryFee     Decimal       @default(0) @db.Decimal(10,2)
  total           Decimal       @db.Decimal(10,2)
  status          OrderStatus   @default(AWAITING_PAYMENT)
  paymentMethod   PaymentMethod @default(WHATSAPP_MANUAL)
  paymentStatus   PaymentStatus @default(UNPAID)
  paymentRef      String?                       // Paystack reference later
  paidAt          DateTime?
  paidConfirmedBy String?                       // AdminUser id
  expiresAt       DateTime                      // auto-cancel if still unpaid
  items           OrderItem[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([status, createdAt])
  @@index([scheduledFor])
  @@index([paymentStatus, paidAt])              // reports
  @@index([phone])
}

model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  menuItemId String
  nameSnap   String
  unitSnap   String?                            // "bowl" for bulk lines
  priceSnap  Decimal  @db.Decimal(10,2)
  quantity   Int
  selections Json?                              // snapshot: [{ group, option, priceDelta }]
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id])

  @@index([menuItemId])
}
```

## Rules enforced in code
- Move past PAID only if `paymentStatus = PAID`.
- Every order requires `address` (delivery only for now; `PICKUP` stays in the enum for later).
- Regular orders (`Order.isBulk = false`) are always instant, no scheduling: items must have `bulkOnly = false`, `isAvailable = true`; kitchen open.
- Bulk orders (`Order.isBulk = true`): all items `bulkEnabled = true` with `bulkPrice` and `bulkUnit` set, not archived; quantity >= 1 (no minimum); `scheduledFor >= now + bulkLeadHours`. Line price is `bulkPrice`.
- `bulkEnabled` cannot be true unless `bulkPrice > 0` and `bulkUnit` is set.
- Every non-archived dish is listed in the Bulk manager automatically; new regular dishes start with bulk off.
- A cart cannot mix bulk and regular items.
- `expiresAt`: ordinary = createdAt + `unpaidExpiryMin`; bulk = createdAt + `bulkUnpaidExpiryHours`.

- A regular dish cannot be switched available without a price (this is why drinks stay off until the owner prices them).
- Options: every option group attached to a dish must have exactly one available option selected (skipped for groups with `showInBulk = false` on bulk orders). Unavailable options are rejected. Server computes line price = base price (or `bulkPrice`) + sum of `priceDelta`, and stores the choices in `OrderItem.selections`.
- Extras (`isExtra = true`) are normal dishes: added as their own order lines under the dish they were picked for, or ordered alone.

## Reporting queries (paid orders only, Africa/Accra)
- Daily revenue: `SUM(total)` where `paymentStatus = PAID` and `status != CANCELLED`, grouped by `date(paidAt at time zone 'Africa/Accra')`.
- Monthly revenue: same, grouped by month.
- Best sellers: `SUM(OrderItem.quantity)` and `SUM(quantity * priceSnap)` grouped by `menuItemId` (show `nameSnap`, plus `Order.isBulk` tag), same filters and range, ordered by quantity desc, limit 10.
- Metrics: order count and average order value from the same set.

## Security
- Supabase RLS: public read on visible `MenuItem` (not archived), `Category` and public `Kitchen` fields; no public write. Bulk fields are readable only when `bulkEnabled = true`.
- Orders created only through the server route (service role).
- Order status page uses the unguessable cuid.
- Admin tables, mark-as-paid, status updates, bulk pricing and reports restricted to authenticated `AdminUser` (bulk pricing and reports OWNER only).
- Storage: public read, admin-only write.
- Price, name and unit snapshots on `OrderItem` keep history and reports correct after edits.
