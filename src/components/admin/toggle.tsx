"use client";

// An on/off switch. `pending` dims it while the change saves.
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  pending,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  pending?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || pending}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-(--duration-base) ease-(--ease-out) disabled:opacity-40 ${
        checked ? "bg-brand" : "bg-muted/35"
      } ${pending ? "opacity-60" : ""}`}
    >
      <span
        className={`inline-block size-6 rounded-full bg-white shadow-soft transition-transform duration-(--duration-base) ease-(--ease-out) ${
          checked ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}
