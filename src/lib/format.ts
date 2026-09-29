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

const TIME_ZONE = "Africa/Accra";

export function formatTimeOfDay(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-GB", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDayAndTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
