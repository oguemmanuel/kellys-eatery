"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ImageError, uploadDishImage } from "@/lib/images";
import { NEXT_STATUS } from "@/lib/order-status";
import { markPaidManually, PaymentError } from "@/lib/payments";

export type ActionResult = { error?: string };

function done(): ActionResult {
  revalidatePath("/admin", "layout");
  return {};
}

// ---------- Orders ----------

export async function markPaid(orderId: string): Promise<ActionResult> {
  const admin = await assertAdmin();
  try {
    await markPaidManually(orderId, admin.id);
  } catch (err) {
    if (err instanceof PaymentError) return { error: err.message };
    throw err;
  }
  return done();
}

// Moves a paid order one step along. The payment gate is enforced in the
// query itself: an unpaid order never matches.
export async function advanceOrder(orderId: string): Promise<ActionResult> {
  await assertAdmin();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, paymentStatus: true },
  });
  if (!order) return { error: "Order not found." };
  const next = NEXT_STATUS[order.status];
  if (!next || order.paymentStatus !== "PAID") {
    return { error: "This order must be paid before it can move on." };
  }
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: order.status, paymentStatus: "PAID" },
    data: { status: next },
  });
  if (result.count === 0)
    return { error: "This order was just updated. Please check again." };
  return done();
}

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  await assertAdmin();
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: { notIn: ["COMPLETED", "CANCELLED"] } },
    data: { status: "CANCELLED" },
  });
  if (result.count === 0)
    return { error: "This order can no longer be cancelled." };
  return done();
}

// ---------- Kitchen ----------

export async function setKitchenOpen(isOpen: boolean): Promise<ActionResult> {
  await assertAdmin();
  await prisma.kitchen.updateMany({ data: { isOpen } });
  return done();
}

// ---------- Menu ----------

function parseMoney(value: FormDataEntryValue | null): number | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const n = Number(text);
  if (!Number.isFinite(n) || n < 0 || n > 100_000) return NaN;
  return Math.round(n * 100) / 100;
}

export async function setDishAvailable(
  id: string,
  isAvailable: boolean,
): Promise<ActionResult> {
  await assertAdmin();
  if (isAvailable) {
    const dish = await prisma.menuItem.findUnique({
      where: { id },
      select: { price: true },
    });
    if (dish?.price === null)
      return { error: "Set a price before switching this dish on." };
  }
  await prisma.menuItem.update({ where: { id }, data: { isAvailable } });
  return done();
}

export type DishFormState = { error?: string; savedId?: string };

// Creates or updates a dish from the dish form.
export async function saveDish(
  _prev: DishFormState,
  form: FormData,
): Promise<DishFormState> {
  const admin = await assertAdmin();
  const id = String(form.get("id") ?? "") || null;
  const name = String(form.get("name") ?? "")
    .trim()
    .slice(0, 80);
  const description =
    String(form.get("description") ?? "")
      .trim()
      .slice(0, 300) || null;
  const categoryId = String(form.get("categoryId") ?? "") || null;
  const price = parseMoney(form.get("price"));
  const isExtra = form.get("isExtra") === "on";
  let isAvailable = form.get("isAvailable") === "on";
  const groupIds = form.getAll("groupIds").map(String);

  if (name.length < 2) return { error: "Enter the dish name." };
  if (Number.isNaN(price)) return { error: "Enter a valid price." };
  if (price === null) isAvailable = false;

  // Unticking "Show on the regular menu" makes a bulk-only dish.
  const bulkOnly = form.get("showOnMenu") !== "on";
  const data = {
    name,
    description,
    categoryId,
    price,
    isExtra,
    isAvailable: isAvailable && !bulkOnly,
    bulkOnly,
  };

  // Bulk pricing is for the owner only.
  let bulk = {};
  if (admin.role === "OWNER" && form.has("bulkPrice")) {
    const bulkPrice = parseMoney(form.get("bulkPrice"));
    const bulkUnit =
      String(form.get("bulkUnit") ?? "")
        .trim()
        .slice(0, 20) || null;
    if (Number.isNaN(bulkPrice)) return { error: "Enter a valid bulk price." };
    const bulkEnabled = form.get("bulkEnabled") === "on";
    if (bulkEnabled && (!bulkPrice || !bulkUnit)) {
      return { error: "Set a bulk price and unit before switching bulk on." };
    }
    bulk = { bulkPrice, bulkUnit, bulkEnabled };
  }

  let imageUrl: string | undefined;
  const image = form.get("image");
  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await uploadDishImage(image);
    } catch (err) {
      if (err instanceof ImageError) return { error: err.message };
      throw err;
    }
  }

  const groups = await prisma.optionGroup.findMany({
    where: { id: { in: groupIds } },
    select: { id: true },
  });
  const links = groups.map((g) => ({ groupId: g.id }));

  let savedId: string;
  if (id) {
    await prisma.menuItem.update({
      where: { id },
      data: {
        ...data,
        ...bulk,
        ...(imageUrl ? { imageUrl } : {}),
        optionGroups: { deleteMany: {}, create: links },
      },
    });
    savedId = id;
  } else {
    // New dishes go to the end of their category and start with bulk off.
    const last = await prisma.menuItem.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });
    const created = await prisma.menuItem.create({
      data: {
        ...data,
        ...bulk,
        imageUrl,
        sortOrder: (last._max.sortOrder ?? -1) + 1,
        optionGroups: { create: links },
      },
    });
    savedId = created.id;
  }

  revalidatePath("/admin", "layout");
  return { savedId };
}

// Dishes are archived, not deleted, so past orders and reports keep them.
export async function archiveDish(id: string): Promise<ActionResult> {
  await assertAdmin();
  await prisma.menuItem.update({
    where: { id },
    data: { isArchived: true, isAvailable: false, bulkEnabled: false },
  });
  return done();
}

export async function createCategory(name: string): Promise<ActionResult> {
  await assertAdmin();
  const clean = name.trim().slice(0, 40);
  if (clean.length < 2) return { error: "Enter a category name." };
  const last = await prisma.category.aggregate({ _max: { sortOrder: true } });
  await prisma.category.create({
    data: { name: clean, sortOrder: (last._max.sortOrder ?? 0) + 1 },
  });
  return done();
}

// ---------- Bulk manager (owner only) ----------

export async function setBulkDetails(
  id: string,
  priceText: string,
  unitText: string,
): Promise<ActionResult> {
  await assertAdmin("OWNER");
  const bulkPrice = parseMoney(priceText);
  const bulkUnit = unitText.trim().slice(0, 20) || null;
  if (Number.isNaN(bulkPrice)) return { error: "Enter a valid price." };
  // Clearing the price or unit also takes the dish off the Bulk page.
  const off = !bulkPrice || !bulkUnit ? { bulkEnabled: false } : {};
  await prisma.menuItem.update({
    where: { id },
    data: { bulkPrice, bulkUnit, ...off },
  });
  return done();
}

export async function setBulkEnabled(
  id: string,
  bulkEnabled: boolean,
): Promise<ActionResult> {
  await assertAdmin("OWNER");
  if (bulkEnabled) {
    const dish = await prisma.menuItem.findUnique({
      where: { id },
      select: { bulkPrice: true, bulkUnit: true },
    });
    if (!dish?.bulkPrice || Number(dish.bulkPrice) <= 0 || !dish.bulkUnit) {
      return { error: "Set the price first, then switch the dish on." };
    }
  }
  await prisma.menuItem.update({ where: { id }, data: { bulkEnabled } });
  return done();
}

// ---------- Choices ----------

export async function setOptionAvailable(
  id: string,
  isAvailable: boolean,
): Promise<ActionResult> {
  await assertAdmin();
  await prisma.option.update({ where: { id }, data: { isAvailable } });
  return done();
}

export async function saveOption(
  id: string,
  name: string,
  priceText: string,
): Promise<ActionResult> {
  await assertAdmin();
  const clean = name.trim().slice(0, 40);
  const priceDelta = parseMoney(priceText) ?? 0;
  if (clean.length < 1) return { error: "Enter a name." };
  if (Number.isNaN(priceDelta)) return { error: "Enter a valid extra price." };
  await prisma.option.update({
    where: { id },
    data: { name: clean, priceDelta },
  });
  return done();
}

export async function addOption(
  groupId: string,
  name: string,
): Promise<ActionResult> {
  await assertAdmin();
  const clean = name.trim().slice(0, 40);
  if (clean.length < 1) return { error: "Enter a name." };
  const last = await prisma.option.aggregate({
    where: { groupId },
    _max: { sortOrder: true },
  });
  await prisma.option.create({
    data: { groupId, name: clean, sortOrder: (last._max.sortOrder ?? -1) + 1 },
  });
  return done();
}

// Past orders keep a copy of the choice, so deleting an option is safe.
export async function deleteOption(id: string): Promise<ActionResult> {
  await assertAdmin();
  await prisma.option.delete({ where: { id } });
  return done();
}

export async function updateGroup(
  id: string,
  data: { name?: string; isRequired?: boolean; showInBulk?: boolean },
): Promise<ActionResult> {
  await assertAdmin();
  const name = data.name?.trim().slice(0, 40);
  if (data.name !== undefined && !name) return { error: "Enter a name." };
  await prisma.optionGroup.update({
    where: { id },
    data: { name, isRequired: data.isRequired, showInBulk: data.showInBulk },
  });
  return done();
}

export async function createGroup(name: string): Promise<ActionResult> {
  await assertAdmin();
  const clean = name.trim().slice(0, 40);
  if (clean.length < 2) return { error: "Enter a name for the choice." };
  const last = await prisma.optionGroup.aggregate({
    _max: { sortOrder: true },
  });
  await prisma.optionGroup.create({
    data: { name: clean, sortOrder: (last._max.sortOrder ?? 0) + 1 },
  });
  return done();
}

// Chooses which dishes ask for this choice.
export async function setGroupDishes(
  groupId: string,
  dishIds: string[],
): Promise<ActionResult> {
  await assertAdmin();
  await prisma.$transaction([
    prisma.menuItemOptionGroup.deleteMany({ where: { groupId } }),
    prisma.menuItemOptionGroup.createMany({
      data: dishIds.map((menuItemId) => ({ groupId, menuItemId })),
      skipDuplicates: true,
    }),
  ]);
  return done();
}
