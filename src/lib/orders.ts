import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

// Order rules from docs/02-technical-requirements.md. Every price is recomputed
// here from the database; nothing the browser sends about prices is trusted.

export type OrderLineInput = {
  menuItemId: string;
  quantity: number;
  optionIds: string[];
};

export type OrderInput = {
  isBulk: boolean;
  customerName: string;
  phone: string;
  address: string;
  landmark?: string;
  scheduledFor?: string; // bulk only, ISO date-time
  items: OrderLineInput[];
};

export class OrderError extends Error {
  constructor(
    message: string,
    // Lets the checkout send the customer back to fix their cart.
    readonly code:
      | "invalid"
      | "unavailable"
      | "closed"
      | "too_soon" = "invalid",
  ) {
    super(message);
  }
}

const MAX_LINES = 50;
const MAX_QUANTITY = 100;
const MAX_BULK_DAYS_AHEAD = 90;

// Ghana numbers: 0XX XXX XXXX, 233XX XXX XXXX or +233... Stored as 233XXXXXXXXX.
export function normalizeGhanaPhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("233")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  if (!/^[235]\d{8}$/.test(digits)) return null;
  return `233${digits}`;
}

const toPesewas = (value: Prisma.Decimal | number) =>
  Math.round(Number(value) * 100);

const fromPesewas = (pesewas: number) => new Prisma.Decimal(pesewas).div(100);

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Validates the raw request body into an OrderInput.
export function parseOrderInput(body: unknown): OrderInput {
  if (!body || typeof body !== "object") throw new OrderError("Invalid order.");
  const b = body as Record<string, unknown>;

  const customerName = cleanText(b.customerName, 80);
  if (customerName.length < 2) throw new OrderError("Please enter your name.");

  const phone = normalizeGhanaPhone(cleanText(b.phone, 20));
  if (!phone) throw new OrderError("Please enter a valid Ghana phone number.");

  const address = cleanText(b.address, 200);
  if (address.length < 4)
    throw new OrderError("Please enter your delivery address.");

  if (!Array.isArray(b.items) || b.items.length === 0) {
    throw new OrderError("Your cart is empty.");
  }
  if (b.items.length > MAX_LINES)
    throw new OrderError("Too many items in one order.");

  const items = b.items.map((raw): OrderLineInput => {
    const line = (raw ?? {}) as Record<string, unknown>;
    const quantity = Number(line.quantity);
    if (
      typeof line.menuItemId !== "string" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_QUANTITY
    ) {
      throw new OrderError("Invalid item in your cart.");
    }
    const optionIds = Array.isArray(line.optionIds)
      ? line.optionIds.filter((id): id is string => typeof id === "string")
      : [];
    return { menuItemId: line.menuItemId, quantity, optionIds };
  });

  return {
    isBulk: b.isBulk === true,
    customerName,
    phone,
    address,
    landmark: cleanText(b.landmark, 120) || undefined,
    scheduledFor:
      typeof b.scheduledFor === "string" ? b.scheduledFor : undefined,
    items,
  };
}

export async function createOrder(input: OrderInput) {
  const kitchen = await prisma.kitchen.findFirst();
  if (!kitchen)
    throw new OrderError("The kitchen is not set up yet.", "closed");

  const now = new Date();
  let scheduledFor: Date | null = null;

  if (input.isBulk) {
    scheduledFor = input.scheduledFor ? new Date(input.scheduledFor) : null;
    if (!scheduledFor || Number.isNaN(scheduledFor.getTime())) {
      throw new OrderError("Please choose a delivery date and time.");
    }
    const earliest = now.getTime() + kitchen.bulkLeadHours * 3_600_000;
    if (scheduledFor.getTime() < earliest) {
      throw new OrderError("Please choose a later delivery time.", "too_soon");
    }
    if (
      scheduledFor.getTime() >
      now.getTime() + MAX_BULK_DAYS_AHEAD * 86_400_000
    ) {
      throw new OrderError(
        "Please choose a delivery date within the next 3 months.",
      );
    }
  } else if (!kitchen.isOpen) {
    throw new OrderError("We are closed right now.", "closed");
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: input.items.map((i) => i.menuItemId) } },
    include: {
      optionGroups: { include: { group: { include: { options: true } } } },
    },
  });
  const byId = new Map(menuItems.map((m) => [m.id, m]));

  let subtotal = 0;
  const lines = input.items.map((line) => {
    const item = byId.get(line.menuItemId);
    if (!item || item.isArchived) {
      throw new OrderError(
        "An item in your cart is no longer on the menu.",
        "unavailable",
      );
    }

    let basePrice: number;
    if (input.isBulk) {
      if (!item.bulkEnabled || item.bulkPrice === null || !item.bulkUnit) {
        throw new OrderError(
          `${item.name} is not available for bulk orders.`,
          "unavailable",
        );
      }
      basePrice = toPesewas(item.bulkPrice);
    } else {
      if (item.bulkOnly || !item.isAvailable || item.price === null) {
        throw new OrderError(`${item.name} is sold out today.`, "unavailable");
      }
      basePrice = toPesewas(item.price);
    }

    // Exactly one available option per group this dish uses. Bulk orders only
    // ask for groups marked showInBulk (meat yes, swallow no).
    const groups = item.optionGroups
      .map((link) => link.group)
      .filter((g) => !input.isBulk || g.showInBulk);
    const allowedIds = new Set(
      groups.flatMap((g) => g.options.map((o) => o.id)),
    );
    if (line.optionIds.some((id) => !allowedIds.has(id))) {
      throw new OrderError(`Please check your choices for ${item.name}.`);
    }

    const selections: { group: string; option: string; priceDelta: number }[] =
      [];
    let deltas = 0;
    for (const group of groups) {
      const picked = group.options.filter((o) => line.optionIds.includes(o.id));
      if (picked.length > 1) {
        throw new OrderError(
          `Please pick one ${group.name.toLowerCase()} for ${item.name}.`,
        );
      }
      const option = picked[0];
      if (!option) {
        if (group.isRequired) {
          throw new OrderError(
            `Please pick a ${group.name.toLowerCase()} for ${item.name}.`,
          );
        }
        continue;
      }
      if (!option.isAvailable) {
        throw new OrderError(
          `${option.name} is sold out today.`,
          "unavailable",
        );
      }
      deltas += toPesewas(option.priceDelta);
      selections.push({
        group: group.name,
        option: option.name,
        priceDelta: Number(option.priceDelta),
      });
    }

    const unit = basePrice + deltas;
    subtotal += unit * line.quantity;
    return {
      menuItemId: item.id,
      nameSnap: item.name,
      unitSnap: input.isBulk ? item.bulkUnit : null,
      priceSnap: fromPesewas(unit),
      quantity: line.quantity,
      selections: selections.length > 0 ? selections : Prisma.JsonNull,
    };
  });

  // No delivery fee yet: the rider is arranged and paid on WhatsApp.
  const deliveryFee = 0;
  const expiresAt = new Date(
    now.getTime() +
      (input.isBulk
        ? kitchen.bulkUnpaidExpiryHours * 3_600_000
        : kitchen.unpaidExpiryMin * 60_000),
  );

  return prisma.order.create({
    data: {
      customerName: input.customerName,
      phone: input.phone,
      address: input.address,
      landmark: input.landmark,
      isBulk: input.isBulk,
      scheduledFor,
      subtotal: fromPesewas(subtotal),
      deliveryFee: fromPesewas(deliveryFee),
      total: fromPesewas(subtotal + deliveryFee),
      expiresAt,
      items: { create: lines },
    },
    select: { id: true, number: true },
  });
}

export type OrderView = Awaited<ReturnType<typeof getOrder>>;

// Reads an order for its status page. An unpaid order past its payment window
// is cancelled here, so the page is right even before the expiry job runs.
export async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { orderBy: { id: "asc" } } },
  });
  if (!order) return null;

  if (
    order.status === "AWAITING_PAYMENT" &&
    order.paymentStatus === "UNPAID" &&
    order.expiresAt.getTime() <= Date.now()
  ) {
    await prisma.order.updateMany({
      where: { id, status: "AWAITING_PAYMENT", paymentStatus: "UNPAID" },
      data: { status: "CANCELLED" },
    });
    order.status = "CANCELLED";
  }

  return {
    id: order.id,
    number: order.number,
    customerName: order.customerName,
    phone: order.phone,
    address: order.address,
    landmark: order.landmark,
    isBulk: order.isBulk,
    scheduledFor: order.scheduledFor?.toISOString() ?? null,
    total: Number(order.total),
    status: order.status,
    paymentStatus: order.paymentStatus,
    expiresAt: order.expiresAt.toISOString(),
    items: order.items.map((i) => ({
      id: i.id,
      name: i.nameSnap,
      unit: i.unitSnap,
      price: Number(i.priceSnap),
      quantity: i.quantity,
      selections: Array.isArray(i.selections)
        ? (i.selections as { option: string }[]).map((s) => s.option)
        : [],
    })),
  };
}
