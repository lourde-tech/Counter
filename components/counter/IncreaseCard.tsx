import type { Increase } from "@/lib/compare";
import { formatMoney, formatPct } from "@/lib/format";
import { card, figure } from "./styles";

export default function IncreaseCard({ increase }: { increase: Increase }) {
  const { amount, pct, overLease, current, proposed, leaseMonths } = increase;

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
      <p className="text-sm font-medium text-slate">{amount > 0 ? "Your increase" : "Your renewal offer"}</p>
      <p className={`${figure} mt-2 text-xl leading-snug font-semibold`}>
        {parts.map((p, i) => (
          <span key={p}>
            {i > 0 && <span className="px-1.5 font-normal text-slate">·</span>}
            <span className={i === 0 && amount > 0 ? "text-ember" : undefined}>{p}</span>
          </span>
        ))}
      </p>
      <p className="mt-2 text-sm text-slate">
        From <span className={figure}>{formatMoney(current)}</span> to{" "}
        <span className={figure}>{formatMoney(proposed)}</span> a month, on a {leaseMonths}{"‑"}month lease.
      </p>
    </section>
  );
}
