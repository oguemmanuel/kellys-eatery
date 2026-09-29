import "server-only";
import { headers } from "next/headers";

// The public address of the site. NEXT_PUBLIC_SITE_URL wins so the QR code
// and shared links point at the real domain, not a preview address.
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "";
}
