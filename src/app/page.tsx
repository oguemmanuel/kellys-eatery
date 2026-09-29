import Image from "next/image";
import Link from "next/link";
import { ChefHatIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { OpenBadge } from "@/components/open-badge";
import { displayPhone, whatsappLink } from "@/lib/format";
import { getKitchen } from "@/lib/menu";

// Always read the live open/closed state and kitchen details.
export const dynamic = "force-dynamic";

const DEFAULT_STORY =
  "Kelly's Eatery is an online kitchen cooking jollof, fried rice, rich soups and swallow the way home does it. Everything is made fresh and delivered to your door.";

const STEPS = [
  { title: "Pick", text: "Choose from what is fresh today." },
  { title: "Order", text: "Place your order in a few taps." },
  { title: "Pay on WhatsApp", text: "Send your order and pay us there." },
  { title: "We deliver", text: "Your food comes hot to your door." },
];

export default async function Home() {
  const kitchen = await getKitchen();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 pb-10">
      <header className="px-5 pt-6 text-center">
        <Image
          src="/brand/logo.webp"
          alt="Kelly's Eatery"
          width={600}
          height={260}
          priority
          className="mx-auto h-auto w-60"
        />
        <p className="mt-1 font-script text-xl text-accent-text">
          Treat yourself to a good meal today!
        </p>
      </header>

      <section className="px-5 pt-4">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-md">
          <Image
            src={kitchen.heroImageUrl ?? "/brand/hero-jollof.webp"}
            alt="A plate of jollof rice with stew from Kelly's Eatery"
            fill
            priority
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-contain"
          />
        </div>
        <h1 className="mt-4 text-center font-display text-4xl leading-tight font-bold text-brand">
          Good <span className="text-accent-text">life</span> is Good food!
        </h1>
        <div className="mt-3 flex justify-center">
          <OpenBadge isOpen={kitchen.isOpen} />
        </div>
      </section>

      <section className="mt-6 grid gap-3 px-5">
        <Link
          href="/menu"
          className="flex min-h-14 items-center justify-center rounded-2xl bg-brand px-6 text-lg font-semibold text-white shadow-sm active:bg-brand-dark"
        >
          See today&apos;s menu
        </Link>
        <Link
          href="/bulk"
          className="flex min-h-14 items-center justify-center rounded-2xl bg-accent px-6 text-lg font-semibold text-brand-dark shadow-sm active:bg-accent-dark"
        >
          Bulk orders
        </Link>
        {!kitchen.isOpen && (
          <p className="text-center text-sm text-muted">
            We are closed right now. You can still look at the menu and place a
            bulk order for a later date.
          </p>
        )}
      </section>

      <section className="mx-5 mt-8 rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-brand">
          <ChefHatIcon className="size-6" />
          <h2 className="font-display text-xl font-bold">Our kitchen</h2>
        </div>
        <p className="mt-2 leading-relaxed text-muted">
          {kitchen.story ?? DEFAULT_STORY}
        </p>
      </section>

      <section className="mx-5 mt-4 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-brand">
          How it works
        </h2>
        <ol className="mt-3 grid grid-cols-2 gap-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl bg-cream p-3">
              <span className="grid size-7 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-2 font-semibold text-ink">{step.title}</p>
              <p className="text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {kitchen.openingHours && kitchen.openingHours.length > 0 && (
        <section className="mx-5 mt-4 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-brand">
            Opening hours
          </h2>
          <dl className="mt-2 divide-y divide-cream-dark">
            {kitchen.openingHours.map((row) => (
              <div key={row.days} className="flex justify-between py-2">
                <dt className="text-muted">{row.days}</dt>
                <dd className="font-medium">{row.hours}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mx-5 mt-4 rounded-3xl bg-brand p-5 text-white">
        <h2 className="font-display text-xl font-bold">Calling and WhatsApp</h2>
        <p className="mt-1 text-lg font-semibold tracking-wide">
          {displayPhone(kitchen.phone)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href={whatsappLink(kitchen.whatsapp)}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white font-semibold text-brand"
          >
            <WhatsAppIcon className="size-5" />
            WhatsApp
          </a>
          <a
            href={`tel:+${kitchen.phone.replace(/\D/g, "")}`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/40 font-semibold"
          >
            <PhoneIcon className="size-5" />
            Call us
          </a>
        </div>
      </section>
    </main>
  );
}
