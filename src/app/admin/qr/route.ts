import { getAdmin } from "@/lib/auth";
import { qrPng, qrSvg } from "@/lib/qr";
import { getSiteUrl } from "@/lib/site";

// Downloads the QR code for the intro page: ?format=png (default) or svg.
export async function GET(request: Request) {
  const admin = await getAdmin();
  if (admin?.role !== "OWNER") {
    return new Response("Not allowed", { status: 403 });
  }

  const url = `${await getSiteUrl()}/`;
  const format = new URL(request.url).searchParams.get("format");

  if (format === "svg") {
    return new Response(await qrSvg(url), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": 'attachment; filename="kellys-eatery-qr.svg"',
      },
    });
  }

  return new Response(new Uint8Array(await qrPng(url)), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="kellys-eatery-qr.png"',
    },
  });
}
