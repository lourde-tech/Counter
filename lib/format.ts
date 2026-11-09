/** Display helpers shared by the comparison logic, templates and screens. */

const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const withCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Round to cents to keep float noise (0.1 + 0.2) out of money math. */
export function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}

/** $1,650 for whole dollars, $1,487.50 when there are cents. Always positive; callers add signs. */
export function formatMoney(n: number): string {
  const v = Math.abs(roundCents(n));
  return Number.isInteger(v) ? wholeDollars.format(v) : withCents.format(v);
}

/** 0.0667 -> "6.7%", 0.05 -> "5%". Always positive; callers add signs. */
export function formatPct(ratio: number): string {
  const pct = Math.round(Math.abs(ratio) * 1000) / 10;
  return `${Number.isInteger(pct) ? pct.toFixed(0) : pct.toFixed(1)}%`;
}

export function plural(n: number, one: string, many: string = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** "A", "A and B", "A, B and C" */
export function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

/** 0 -> "Studio", 2 -> "2 bed" */
export function bedsLabel(beds: number): string {
  return beds === 0 ? "Studio" : `${beds} bed`;
}

/** 0 beds/1 bath -> "Studio/1BA", 2 beds/1.5 baths -> "2BR/1.5BA" */
export function bedBathShort(beds: number, baths: number): string {
  return `${beds === 0 ? "Studio" : `${beds}BR`}/${baths}BA`;
}

/** "2026-11-02" -> "Nov 2, 2026". Parsed as a calendar date so time zones can't shift it. */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
