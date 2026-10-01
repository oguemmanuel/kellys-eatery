import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/icons";
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
    <main className="mx-auto w-full max-w-xl flex-1">
      <header className="flex items-center justify-between gap-3 px-5 pt-5">
        <Image
          src="/brand/logo.webp"
          alt="Kelly's Eatery"
          width={600}
          height={260}
          priority
          className="h-auto w-36"
        />
        <OpenBadge isOpen={kitchen.isOpen} />
      </header>

      <section className="px-5 pt-2 text-center">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-md animate-rise">
          <Image
            src={kitchen.heroImageUrl ?? "/brand/hero-jollof.webp"}
            alt="A plate of jollof rice with stew from Kelly's Eatery"
            fill
            priority
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-contain"
          />
        </div>
        <h1
          className="stagger mt-2 animate-rise font-display text-[2.5rem] leading-[1.05] font-bold text-brand"
          style={{ "--i": 1 } as React.CSSProperties}
        >
          Good life is Good food!
        </h1>
        <p
          className="stagger mt-2 animate-rise font-script text-xl text-accent-text"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          Treat yourself to a good meal today!
        </p>
      </section>

      <section
        className="stagger mt-6 grid animate-rise gap-3 px-5"
        style={{ "--i": 3 } as React.CSSProperties}
      >
        <Link
          href="/menu"
          className="press flex min-h-15 items-center justify-between rounded-2xl bg-brand pr-4 pl-6 text-lg font-semibold text-white shadow-lift active:bg-brand-dark"
        >
          See today&apos;s menu
          <span className="grid size-9 place-items-center rounded-full bg-white/15">
            <ArrowRightIcon className="size-5" />
          </span>
        </Link>
        <Link
          href="/bulk"
          className="press flex min-h-15 items-center justify-between gap-3 rounded-2xl border-2 border-accent bg-paper pr-4 pl-6 text-left active:bg-white"
        >
          <span>
            <span className="block text-lg font-semibold text-brand-dark">
              Bulk orders
            </span>
            <span className="block text-sm text-muted">
              By the bowl, {kitchen.bulkLeadHours}h ahead
            </span>
          </span>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-brand-dark">
            <ArrowRightIcon className="size-5" />
          </span>
        </Link>
        {!kitchen.isOpen && (
          <p className="text-center text-sm text-muted">
            We are closed right now. You can still look at the menu and place a
            bulk order for a later date.
          </p>
        )}
      </section>

      <section className="mt-10 px-5">
        <h2 className="font-display text-xl font-bold text-brand">
          How it works
        </h2>
        <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand font-display text-sm font-bold text-white">
                {i + 1}
              </span>
              <span>
                <span className="block leading-tight font-semibold text-ink">
                  {step.title}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-muted">
                  {step.text}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 border-t border-line px-5 pt-8">
        <h2 className="font-display text-xl font-bold text-brand">
          Our kitchen
        </h2>
        <p className="mt-2 leading-relaxed text-ink/80">
          {kitchen.story ?? DEFAULT_STORY}
        </p>
      </section>

      {kitchen.openingHours && kitchen.openingHours.length > 0 && (
        <section className="mt-8 px-5">
          <h2 className="font-display text-xl font-bold text-brand">
            Opening hours
          </h2>
          <dl className="mt-2 divide-y divide-line">
            {kitchen.openingHours.map((row) => (
              <div key={row.days} className="flex justify-between py-2.5">
                <dt className="text-muted">{row.days}</dt>
                <dd className="font-medium">{row.hours}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-10 bg-brand px-5 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-white sm:mx-5 sm:mb-8 sm:rounded-3xl">
        <p className="text-sm font-medium text-white/70">
          Calling and WhatsApp
        </p>
        <p className="mt-1 font-display text-3xl font-bold tracking-wide tabular-nums">
          {displayPhone(kitchen.phone)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={whatsappLink(kitchen.whatsapp)}
            className="press flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white font-semibold text-brand active:bg-cream"
          >
            <WhatsAppIcon className="size-5" />
            WhatsApp
          </a>
          <a
            href={`tel:+${kitchen.phone.replace(/\D/g, "")}`}
            className="press flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/40 font-semibold active:bg-white/10"
          >
            <PhoneIcon className="size-5" />
            Call us
          </a>
        </div>
        <p className="mt-8 text-center font-script text-lg text-accent">
          Good life is Good food!
        </p>
      </section>
    </main>
  );
}
