import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { displayPhone } from "@/lib/format";
import { getKitchen } from "@/lib/menu";
import { qrSvg } from "@/lib/qr";
import { getSiteUrl } from "@/lib/site";
import { PrintButton } from "./print-button";

export const metadata: Metadata = {
  title: "QR poster | Kelly's Eatery",
  robots: { index: false },
};

// An A4 poster with the QR code, ready to print or save as a PDF from the
// phone's share or print menu.
export default async function PosterPage() {
  await requireAdmin("OWNER");
  const [kitchen, siteUrl] = await Promise.all([getKitchen(), getSiteUrl()]);
  const svg = await qrSvg(`${siteUrl}/`);
  const shownUrl = siteUrl.replace(/^https?:\/\//, "");

  return (
    <main className="flex flex-1 flex-col items-center bg-cream-dark/40 px-4 py-6 print:bg-white print:p-0">
      <style>{`@page { size: A4; margin: 0; }`}</style>
      <div className="mb-4 flex w-full max-w-[210mm] items-center justify-between gap-3 print:hidden">
        <Link
          href="/admin/settings"
          className="font-semibold text-brand underline"
        >
          Back to settings
        </Link>
        <PrintButton />
      </div>

      <article className="flex aspect-[210/297] w-full max-w-[210mm] flex-col items-center justify-between bg-cream px-[8%] py-[9%] text-center shadow-lg print:h-[297mm] print:w-[210mm] print:max-w-none print:shadow-none">
        <div>
          <Image
            src="/brand/logo.webp"
            alt="Kelly's Eatery"
            width={600}
            height={260}
            priority
            className="mx-auto h-auto w-[60%]"
          />
          <p className="mt-2 font-script text-[clamp(1rem,4vw,2rem)] text-accent-text">
            {kitchen.tagline ?? "Good life is Good food!"}
          </p>
        </div>

        <div className="w-full">
          <p className="font-display text-[clamp(1.5rem,6vw,3rem)] leading-tight font-bold text-brand">
            Scan to see today&apos;s menu and order
          </p>
          <div
            className="mx-auto mt-[5%] w-[62%] rounded-3xl bg-white p-[3%] shadow-sm [&>svg]:h-auto [&>svg]:w-full"
            role="img"
            aria-label={`QR code for ${shownUrl}`}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <p className="mt-[4%] text-[clamp(0.9rem,3vw,1.5rem)] font-semibold text-ink">
            {shownUrl}
          </p>
        </div>

        <p className="text-[clamp(0.9rem,3vw,1.5rem)] text-ink">
          Bulk orders for events too. WhatsApp{" "}
          <span className="font-semibold">
            {displayPhone(kitchen.whatsapp)}
          </span>
        </p>
      </article>
    </main>
  );
}
