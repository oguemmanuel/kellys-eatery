export function OpenBadge({ isOpen }: { isOpen: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
        isOpen ? "bg-brand-light text-brand" : "bg-cream-dark text-muted"
      }`}
    >
      <span
        className={`size-2 rounded-full ${isOpen ? "bg-brand" : "bg-muted"}`}
        aria-hidden
      />
      {isOpen ? "Open now" : "Closed now"}
    </span>
  );
}
