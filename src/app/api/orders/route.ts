import { NextResponse, type NextRequest } from "next/server";
import { createOrder, OrderError, parseOrderInput } from "@/lib/orders";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`orders:${ip}`, 10, 10 * 60_000)) {
    return NextResponse.json(
      { error: "Too many orders from this device. Please wait a few minutes." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  // Honeypot: people never see this field, bots fill it in.
  if (
    body &&
    typeof body === "object" &&
    (body as { website?: unknown }).website
  ) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  try {
    const order = await createOrder(parseOrderInput(body));
    return NextResponse.json(
      { id: order.id, number: order.number },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.code === "invalid" ? 400 : 409 },
      );
    }
    console.error("Order failed", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
