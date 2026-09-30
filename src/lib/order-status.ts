import type { OrderStatus } from "@prisma/client";

// Orders go from Awaiting payment straight to Completed when the owner marks
// them paid. PAID to OUT_FOR_DELIVERY stay in the schema for older orders.
export const STATUS_LABEL: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  PREPARING: "Paid",
  READY: "Paid",
  OUT_FOR_DELIVERY: "Paid",
  COMPLETED: "Paid",
  CANCELLED: "Cancelled",
};
