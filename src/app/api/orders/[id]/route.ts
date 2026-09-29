import { NextResponse, type NextRequest } from "next/server";
import { getOrder } from "@/lib/orders";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/orders/[id]">,
) {
  const { id } = await ctx.params;
  const order = await getOrder(id);
  if (!order)
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({
    id: order.id,
    number: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    expiresAt: order.expiresAt,
  });
}
