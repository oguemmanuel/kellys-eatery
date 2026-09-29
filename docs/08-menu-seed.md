# 08 - Kelly's Eatery Menu (seed data)

Loaded by `prisma/seed.ts`. Run once after the first migration: `npx prisma db seed`.
Add to `package.json`: `"prisma": { "seed": "tsx prisma/seed.ts" }` (install `tsx`).

## How the menu maps to the system
- **Categories:** Rice and Pasta, Soups, Local Drinks, Extras.
- **Swallow** is a required choice on soups (Eba, Pounded yam, Fufu, Poundo, Semo, Amala, Starch). It has no price of its own, so it is a choice group, not a dish.
- **Meat** is a required choice (Goat, Cow) on every soup. **Jollof meat** is a required choice on "Jollof rice and meat"; the owner can add more meats there, with an optional extra price per meat, from the Choices manager.
- **Extras** are add-on dishes shown on every dish sheet and also orderable alone.
- **Every dish** appears in the Bulk manager automatically, off until the owner sets a bulk price and unit.
- **Drinks** have no price yet, so they are seeded as unavailable until the owner sets prices.

## Rice and Pasta
| Dish | Price (GHS) |
|---|---|
| Jollof rice and meat (choice of meat) | 90 |
| Jollof rice, chicken and plantain | 100 |
| Fried rice and turkey | 100 |
| Fried rice, chicken, salad and plantain | 120 |
| White rice and stew | 90 |
| Spaghetti and chicken | 90 |
| Spaghetti and turkey | 100 |
| Bole (comes with its own, no choices) | 90 |

## Soups
| Dish | Price (GHS) | Choices |
|---|---|---|
| Egusi soup | 100 | Swallow, Meat |
| Ogbono soup | 100 | Swallow, Meat |
| Vegetables soup | 100 | Swallow, Meat |
| Okro soup | 100 | Swallow, Meat |
| Sea food okro | 120 | Swallow, Meat |
| Pepper soup | 90 | Meat |
| Banger soup | 100 | Swallow, Meat |
| Bitterleaf soup | 90 | Swallow, Meat |

## Local Drinks (owner sets prices in admin)
Ginger drink, Zobo, Fruit juice

## Extras
| Extra | Price (GHS) |
|---|---|
| Plantain | 15 |
| Salad | 15 |
| Cow meat | 15 |
| Turkey | 35 |
| Chicken | 25 |
| Fish | 35 |

## Confirmed by the owner
- Swallow is included in the soup price, and the customer picks the swallow they want.
- Every soup comes with a meat of the customer's choice (Goat or Cow to start; owner can add more).
- Bole comes with its own, no choices.
- Jollof rice and meat: the customer chooses the meat (Goat or Cow to start; owner adds more in the Choices manager).
- Drink prices are set by the owner in admin (drinks stay switched off until priced).
- Spellings are correct (Okro, Banger, Vegetables). It is "Okro", not "Okor".
- Because every soup now has a meat choice, "Egusi and goat meat" is seeded as "Egusi soup".

## Still to confirm
1. Which meats can customers pick for soups and for Jollof (only Goat and Cow, or also chicken, turkey, fish)? Do any cost more than the base price?
2. Pepper soup: does it come with a swallow? Currently none.
3. Bulk soup bowls: Meat shows, Swallow does not. Swallow can be added as an extra dish in the Bulk manager.
4. Swallow cannot be ordered alone right now.
