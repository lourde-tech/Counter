import { rowLabel } from "./styles";

/** The design handoff's example renewal card: made-up numbers that show an offer at a glance. */
export default function ExampleRenewalCard() {
  return (
    <section
      aria-label="Example renewal"
      className="flex w-full max-w-[224px] flex-col gap-[6px] rounded-[14px] border border-violet-deep bg-lavender p-[14px] text-ink"
    >
      <p className={rowLabel}>Example renewal</p>
      <p className={rowLabel}>Proposed rent</p>
      <p className="font-display text-[34px] leading-none font-semibold tabular-nums text-ink" data-testid="proposed-rent">
        $2,100 <span className="text-base font-medium text-ink">/ mo</span>
      </p>
      <div className="flex items-baseline justify-between gap-3">
        <span className={rowLabel}>Current rent</span>
        <span className={`${rowLabel} tabular-nums`}>$1,950 / mo</span>
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span className={rowLabel}>Increase</span>
        <span className="font-display text-[13px] font-medium tabular-nums text-violet-deep">+$150 / mo</span>
      </div>
    </section>
  );
}
