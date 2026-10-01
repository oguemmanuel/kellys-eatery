import Link from "next/link";
import { BackIcon } from "@/components/icons";

// Back button, title and an optional line under it, shared by the ordering pages.
export function PageHeader({
  backHref,
  backLabel,
  title,
  subtitle,
  aside,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="flex items-center gap-3">
      <Link
        href={backHref}
        aria-label={backLabel}
        className="press grid size-11 shrink-0 place-items-center rounded-full bg-paper text-brand shadow-soft active:bg-white"
      >
        <BackIcon className="size-5" />
      </Link>
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl leading-tight font-bold text-brand">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {aside}
    </header>
  );
}
