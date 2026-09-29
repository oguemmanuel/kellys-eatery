"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-12 rounded-2xl bg-brand px-5 font-semibold whitespace-nowrap text-white"
    >
      Print or save PDF
    </button>
  );
}
