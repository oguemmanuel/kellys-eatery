import "server-only";
import { prisma } from "@/lib/db";

// Payment confirmation lives here so Paystack can replace the manual step
// later (docs/06-roadmap-after-mvp.md) without touching the order flow.

export class PaymentError extends Error {}

// The owner confirms a WhatsApp payment by hand.
export async function markPaidManually(orderId: string, adminId: string) {
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: "AWAITING_PAYMENT", paymentStatus: "UNPAID" },
    data: {
      status: "PAID",
      paymentStatus: "PAID",
      paymentMethod: "WHATSAPP_MANUAL",
      paidAt: new Date(),
      paidConfirmedBy: adminId,
    },
  });
  if (result.count === 0) {
    throw new PaymentError("This order is no longer waiting for payment.");
  }
}
