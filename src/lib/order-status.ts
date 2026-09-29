import type { OrderStatus } from "@prisma/client";

// Kitchen flow after payment. Nothing here can run until the order is paid.
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PAID: "PREPARING",
  PREPARING: "READY",
  READY: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "COMPLETED",
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Button text for moving an order to the next step.
export const ADVANCE_LABEL: Partial<Record<OrderStatus, string>> = {
  PAID: "Start preparing",
  PREPARING: "Mark ready",
  READY: "Out for delivery",
  OUT_FOR_DELIVERY: "Mark completed",
};
