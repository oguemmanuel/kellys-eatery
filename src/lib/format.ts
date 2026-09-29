export function formatGHS(amount: number): string {
  return `GHS ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function whatsappLink(number: string, text?: string): string {
  const base = `https://wa.me/${number.replace(/\D/g, "")}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// "233592569298" -> "+233 592 569 298"
export function displayPhone(number: string): string {
  const d = number.replace(/\D/g, "");
  if (d.startsWith("233") && d.length === 12) {
    return `+233 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
  }
  return `+${d}`;
}
