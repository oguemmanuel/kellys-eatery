import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import { OpenBadge } from "@/components/open-badge";
import { displayPhone, whatsappLink } from "@/lib/format";
import { getKitchen } from "@/lib/menu";

// Always read the live open/closed state and kitchen details.
export const dynamic = "force-dynamic";

const DEFAULT_STORY =
  "Kelly's Eatery is an online kitchen cooking jollof, fried rice, rich soups and swallow the way home does it. Everything is made fresh and delivered to your door.";

// Laptop-only links in the header; phones use the buttons below the photo.
const NAV = [
  { href: "/menu", label: "Menu" },
  { href: "/bulk", label: "Bulk orders" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#contact", label: "Contact" },
];

const STEPS = [
  { title: "Pick", text: "Choose from what is fresh today." },
  { title: "Order", text: "Place your order in a few taps." },
  { title: "Pay on WhatsApp", text: "Send your order and pay us there." },
  { title: "We deliver", text: "Your food comes hot to your door." },
];

export default async function Home() {
  const kitchen = await getKitchen();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 lg:max-w-6xl">
      <header className="flex items-center justify-between gap-3 px-5 pt-5 lg:px-8 lg:pt-6">
        <Image
          src="/brand/logo.webp"
          alt="Kelly's Eatery"
          width={600}
          height={260}
          priority
          className="h-auto w-36 lg:w-44"
        />
        <nav
          aria-label="Main"
          className="hidden items-center gap-1 text-sm font-semibold text-brand lg:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2.5 transition-colors duration-(--duration-fast) hover:bg-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <OpenBadge isOpen={kitchen.isOpen} />
      </header>

      {/* Phone: photo, then words. Laptop: words left, photo right. */}
      <div className="lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10 lg:px-8 lg:pt-4">
        <div className="px-5 pt-2 lg:order-2 lg:px-0 lg:pt-0">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-md animate-rise lg:max-w-none">
            <Image
              src={kitchen.heroImageUrl ?? "/brand/hero-jollof.webp"}
              alt="A plate of jollof rice with stew from Kelly's Eatery"
              fill
              priority
              sizes="(max-width: 480px) 100vw, (max-width: 1024px) 448px, 600px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="lg:order-1">
          <section className="px-5 text-center lg:px-0 lg:text-left">
            <h1
              className="stagger mt-2 animate-rise font-display text-[2.5rem] leading-[1.05] font-bold text-brand lg:mt-0 lg:text-7xl"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              Good life is Good food!
            </h1>
            <p
              className="stagger mt-2 animate-rise font-script text-xl text-accent-text lg:mt-4 lg:text-3xl"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              Treat yourself to a good meal today!
            </p>
            <p
              className="stagger mt-5 hidden max-w-md animate-rise text-lg leading-relaxed text-ink/75 lg:block"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              Jollof, fried rice, rich soups and swallow, cooked fresh and
              brought hot to your door.
            </p>
          </section>

          <section
            className="stagger mt-6 grid animate-rise gap-3 px-5 lg:mt-8 lg:max-w-md lg:px-0 xl:max-w-xl xl:grid-cols-2"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <Link
              href="/menu"
              className="press flex min-h-15 items-center justify-between rounded-2xl bg-brand pr-4 pl-6 text-lg font-semibold text-white shadow-lift active:bg-brand-dark lg:hover:bg-brand-dark"
            >
              See today&apos;s menu
              <span className="grid size-9 place-items-center rounded-full bg-white/15">
                <ArrowRightIcon className="size-5" />
              </span>
            </Link>
            <Link
              href="/bulk"
              className="press flex min-h-15 items-center justify-between gap-3 rounded-2xl border-2 border-accent bg-paper pr-4 pl-6 text-left active:bg-white lg:pl-5 lg:hover:bg-white"
            >
              <span>
                <span className="block text-lg font-semibold text-brand-dark">
                  Bulk orders
                </span>
                <span className="block text-sm whitespace-nowrap text-muted">
                  By the bowl, {kitchen.bulkLeadHours}h ahead
                </span>
              </span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-brand-dark">
                <ArrowRightIcon className="size-5" />
              </span>
            </Link>
            {!kitchen.isOpen && (
              <p className="text-center text-sm text-muted lg:text-left xl:col-span-2">
                We are closed right now. You can still look at the menu and
                place a bulk order for a later date.
              </p>
            )}
          </section>
        </div>
      </div>

      <section
        id="how-it-works"
        className="mt-10 scroll-mt-6 px-5 lg:mt-16 lg:px-8"
      >
        <h2 className="font-display text-xl font-bold text-brand lg:text-3xl">
          How it works
        </h2>
        <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 lg:mt-6 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-3 lg:flex-col lg:rounded-3xl lg:bg-paper lg:p-6 lg:shadow-soft"
            >
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

      <div
        className={`lg:mt-16 lg:grid lg:gap-16 lg:border-t lg:border-line lg:px-8 lg:pt-12 ${
          kitchen.openingHours?.length
            ? "lg:grid-cols-2"
            : "lg:[&>section]:max-w-3xl"
        }`}
      >
        <section className="mt-10 border-t border-line px-5 pt-8 lg:mt-0 lg:border-0 lg:p-0">
          <h2 className="font-display text-xl font-bold text-brand lg:text-3xl">
            Our kitchen
          </h2>
          <p className="mt-2 leading-relaxed text-ink/80 lg:mt-4 lg:text-lg">
            {kitchen.story ?? DEFAULT_STORY}
          </p>
        </section>

        {kitchen.openingHours && kitchen.openingHours.length > 0 && (
          <section className="mt-8 px-5 lg:mt-0 lg:px-0">
            <h2 className="font-display text-xl font-bold text-brand lg:text-3xl">
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
      </div>

      <section
        id="contact"
        className="mt-10 bg-brand px-5 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-white sm:mx-5 sm:mb-8 sm:rounded-3xl lg:mx-8 lg:mt-16 lg:mb-10 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-x-10 lg:p-10"
      >
        <div>
          <p className="text-sm font-medium text-white/70">
            Calling and WhatsApp
          </p>
          <p className="mt-1 font-display text-3xl font-bold tracking-wide tabular-nums lg:text-5xl">
            {displayPhone(kitchen.phone)}
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:mt-0 lg:w-96">
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
        <p className="mt-8 text-center font-script text-lg text-accent lg:col-span-2 lg:mt-6 lg:text-left lg:text-xl">
          Good life is Good food!
        </p>
      </section>
    </main>
  );
}
