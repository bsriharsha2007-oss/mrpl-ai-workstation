/** Presentation helpers shared across enterprise surfaces. */

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

export function formatDate(value: string | number | Date): string {
  const date = toDate(value);
  return date ? dateFormatter.format(date) : "—";
}

export function formatDateTime(value: string | number | Date): string {
  const date = toDate(value);
  return date ? dateTimeFormatter.format(date) : "—";
}

/** Compact relative time: "4m ago", "3h ago", "2d ago". */
export function relativeTime(value: string | number | Date): string {
  const date = toDate(value);
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 1) return "just now";
  if (Math.abs(minutes) < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `${days}d ago`;
  return formatDate(date);
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** 1,284,200 → "1.28 M" */
export function compactNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

export function percent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** "P-2013B" → "Pump / asset identifier chip label". */
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function bytesFromSizeLabel(size: string): number {
  const match = /([\d.]+)\s*(KB|MB|GB)/i.exec(size);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2].toUpperCase();
  const scale = unit === "GB" ? 1024 : unit === "MB" ? 1 : 1 / 1024;
  return amount * scale;
}

function toDate(value: string | number | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
