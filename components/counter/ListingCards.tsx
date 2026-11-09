import { daysSince, STALE_AFTER_DAYS, type ListingComparison } from "@/lib/compare";
import { formatDate, formatMoney, listingName } from "@/lib/format";
import type { Unit } from "@/lib/types";
import { card, figure } from "./styles";

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

export default function ListingCards({ comparisons, unit, today }: Props) {
  if (comparisons.length === 0) {
    return (
      <div className={card}>
        <p className="font-medium">No listings to show</p>
        <p className="mt-1 text-slate">
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
          <li key={`${listing.url}-${i}`} className={card}>
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium leading-snug">{listingName(listing)}</p>
              <p className={`${figure} shrink-0 text-lg font-semibold`}>
                {formatMoney(listing.advertisedRent)}
                <span className="text-sm font-normal text-slate">/mo</span>
              </p>
            </div>

            {(otherBeds || stale) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {otherBeds && (
                  <span className="rounded-full bg-ember-soft px-2.5 py-0.5 text-xs text-ink">Different bedroom count</span>
                )}
                {stale && (
                  <span className="rounded-full bg-ember-soft px-2.5 py-0.5 text-xs text-ink">
                    Checked over {STALE_AFTER_DAYS} days ago
                  </span>
                )}
              </div>
            )}

            <p className="mt-2 text-sm text-slate">{diffText(diff)}</p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line pt-3 text-sm">
              <span className="text-slate">
                Advertised on <span className="text-ink">{listing.sourceName}</span>
              </span>
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-medium text-ink underline underline-offset-4 hover:text-ember"
              >
                View listing<span aria-hidden>&nbsp;↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            <p className="text-sm text-slate">Checked by the Counter team on {formatDate(listing.checkedDate)}.</p>
          </li>
        );
      })}
    </ul>
  );
}
