import type { Increase } from "@/lib/compare";
import { formatMoney, formatPct } from "@/lib/format";
import { card, figure, rowLabel } from "./styles";

/** Positive deltas in deep violet; zero or negative deltas stay ink. */
export default function IncreaseCard({ increase }: { increase: Increase }) {
  const { amount, pct, overLease, current, proposed, leaseMonths } = increase;
  const deltaColor = amount > 0 ? "text-violet-deep" : "text-ink";

  let parts: string[];
  if (amount > 0) {
    parts = [`+${formatMoney(amount)}/mo`, `+${formatPct(pct)}`, `${formatMoney(overLease)} more over your lease`];
  } else if (amount < 0) {
    parts = [`−${formatMoney(amount)}/mo`, `−${formatPct(pct)}`, `${formatMoney(overLease)} less over your lease`];
  } else {
    parts = ["No change to your rent"];
  }

  return (
    <section className={card} aria-label="Your increase">
      <p className={rowLabel}>{amount > 0 ? "Your increase" : "Your renewal offer"}</p>
      <p className={`${figure} mt-2 text-xl leading-snug font-semibold`} data-delta={amount > 0 ? "positive" : amount < 0 ? "negative" : "zero"}>
        {parts.map((p, i) => (
          <span key={p}>
            {/* Real spaces around the dot so the line can wrap on narrow screens. */}
            {i > 0 && <span className="font-normal text-ink"> · </span>}
            <span data-part className={deltaColor}>{p}</span>
          </span>
        ))}
      </p>
      <p className="mt-2 text-sm text-ink">
        From <span className={`${figure} text-ink`}>{formatMoney(current)}</span> to{" "}
        <span className={`${figure} text-ink`}>{formatMoney(proposed)}</span> a month, on a {leaseMonths}
        {"‑"}month lease.
      </p>
    </section>
  );
}
