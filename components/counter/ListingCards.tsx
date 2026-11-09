import { daysSince, STALE_AFTER_DAYS, type ListingComparison } from "@/lib/compare";
import { formatDate, formatMoney, listingName } from "@/lib/format";
import type { Unit } from "@/lib/types";
import { card, figure, panel, rowLabel } from "./styles";

interface Props {
  comparisons: ListingComparison[];
  unit: Unit;
  today: Date;
}

function diffText(diff: number): string {
  if (diff > 0) return `The new rent is ${formatMoney(diff)} more than this listing.`;
  if (diff < 0) return `The new rent is ${formatMoney(diff)} less than this listing.`;
  return "The new rent is the same as this listing.";
}

const tag = "rounded-full border border-violet-deep bg-lavender px-2.5 py-0.5 font-display text-[13px] font-medium text-ink";

export default function ListingCards({ comparisons, unit, today }: Props) {
  if (comparisons.length === 0) {
    return (
      <div className={card}>
        <p className="font-display font-medium">No listings to show</p>
        <p className="mt-1 text-ink">
          Our team couldn&apos;t verify nearby listings for your unit, so we won&apos;t show numbers we can&apos;t stand
          behind.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {comparisons.map(({ listing, diff }, i) => {
        const otherBeds = listing.beds !== unit.beds;
        const stale = daysSince(listing.checkedDate, today) > STALE_AFTER_DAYS;
        return (
          <li key={`${listing.url}-${i}`} className={panel}>
            <div className="flex items-start justify-between gap-3">
              <p className="font-display font-medium leading-snug">{listingName(listing)}</p>
              <p className={`${figure} shrink-0 text-lg font-semibold text-ink`}>
                {formatMoney(listing.advertisedRent)}
                <span className="text-[13px] font-medium text-ink">/mo</span>
              </p>
            </div>

            {(otherBeds || stale) && (
              <div className="flex flex-wrap gap-1.5">
                {otherBeds && <span className={tag}>Different bedroom count</span>}
                {stale && <span className={tag}>Checked over {STALE_AFTER_DAYS} days ago</span>}
              </div>
            )}

            <p className={rowLabel}>{diffText(diff)}</p>

            <div className={`flex flex-wrap items-center justify-between gap-x-3 border-t border-ink ${rowLabel}`}>
              <span>Advertised on {listing.sourceName}</span>
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-ink underline underline-offset-4 hover:text-violet-deep"
              >
                View listing<span aria-hidden>&nbsp;↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            <p className={rowLabel}>Checked by the Counter team on {formatDate(listing.checkedDate)}.</p>
          </li>
        );
      })}
    </ul>
  );
}
