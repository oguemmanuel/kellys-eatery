import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons";
import { whatsappLink } from "@/lib/format";

// Temporary page for routes built in a later milestone.
export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-brand">{title}</h1>
      <p className="mt-3 text-muted">{text}</p>
      <a
        href={whatsappLink("233592569298")}
        className="mt-6 flex min-h-12 items-center gap-2 rounded-2xl bg-brand px-6 font-semibold text-white"
      >
        <WhatsAppIcon className="size-5" />
        Order on WhatsApp
      </a>
      <Link href="/" className="mt-4 font-semibold text-brand underline">
        Back to Kelly&apos;s Eatery
      </Link>
    </main>
  );
}
