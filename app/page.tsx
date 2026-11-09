import TeamContact from "@/components/counter/TeamContact";
import { heading, rowLabel } from "@/components/counter/styles";

export default function Home() {
  return (
    <div className="pt-16">
      <p className="mb-2 font-display text-base font-semibold tracking-tight">Counter</p>
      <h1 className={heading}>Got a rent increase in Philadelphia?</h1>
      <p className="mt-4 text-lg leading-relaxed">
        Our team looks up nearby listings by hand. You see them, choose what to ask for, and get a message you can edit
        and send yourself.
      </p>

      {/* A made-up example so people can see what an offer looks like at a glance. */}
      <section
        aria-label="Example renewal"
        className="mt-8 flex w-full max-w-[224px] flex-col gap-[6px] rounded-[14px] border border-violet-deep bg-lavender p-[14px] text-ink"
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

      <p className="mt-8 text-lg leading-relaxed">
        If our team sent you a link, open it to get started. Questions? Message us at <TeamContact />.
      </p>
    </div>
  );
}
