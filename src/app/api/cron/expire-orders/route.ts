import { NextResponse, type NextRequest } from "next/server";
import { expireUnpaidOrders } from "@/lib/orders";

// Called by Vercel Cron (vercel.json), which sends CRON_SECRET as a bearer token.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cancelled = await expireUnpaidOrders();
  return NextResponse.json({ cancelled });
}
