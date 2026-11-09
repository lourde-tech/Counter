import ExampleRenewalCard from "./ExampleRenewalCard";
import { figure, rowLabel } from "./styles";

const LISTINGS = [
  { name: "1BR/1BA on Spruce St", rent: "$1,895" },
  { name: "1BR/1BA on S 22nd St", rent: "$1,950" },
  { name: "1BR/1BA on Pine St", rent: "$1,990" },
];

/** A phone-shaped preview of the renter flow, drawn with the real styles. Example numbers only. */
export default function ProductPreview() {
  return (
    <figure aria-label="Example of what a renter sees" className="relative mx-auto w-full max-w-[340px]">
      {/* Solid violet slab behind the phone. */}
      <div aria-hidden className="absolute top-8 -right-3 bottom-[-12px] left-8 rounded-[40px] bg-violet sm:-right-5 sm:bottom-[-20px]" />

      <div className="relative flex flex-col gap-3 rounded-[36px] border border-ink bg-paper p-4">
        <div aria-hidden className="mx-auto h-1.5 w-14 rounded-full bg-ink" />

        <div className="flex items-center justify-between">
          <span className="font-display text-[15px] font-semibold tracking-tight">Counter</span>
          <span className={rowLabel}>Step 3 of 6</span>
        </div>
        <div aria-hidden className="h-1 overflow-hidden rounded-full bg-lavender">
          <div className="h-full w-1/2 rounded-full bg-violet" />
        </div>

        <ExampleRenewalCard />

        <div className="flex flex-col gap-[6px] rounded-[14px] border border-ink bg-paper p-[14px]">
          <p className={rowLabel}>Listings our team checked by hand</p>
          {LISTINGS.map((l) => (
            <div key={l.name} className="flex items-baseline justify-between gap-3">
              <span className={rowLabel}>{l.name}</span>
              <span className={`${figure} text-[13px] font-semibold text-ink`}>
                {l.rent}
                <span className="font-medium">/mo</span>
              </span>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-3 border-t border-ink pt-[6px]">
            <span className={rowLabel}>Middle of the listings</span>
            <span className={`${figure} text-[13px] font-semibold text-ink`}>$1,950</span>
          </div>
        </div>

        <div className="flex flex-col gap-[6px] rounded-[14px] border border-violet bg-lavender p-[14px] ring-1 ring-violet">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span aria-hidden className="flex size-4 items-center justify-center rounded-full border-2 border-violet">
                <span className="size-2 rounded-full bg-violet" />
              </span>
              <span className="font-display text-[13px] font-semibold">Keep my current rent</span>
            </span>
            <span className="rounded-full bg-ink px-2 py-0.5 font-display text-[11px] font-medium text-paper">Suggested</span>
          </div>
          <p className="text-[13px] leading-snug text-ink">
            If your landlord agrees, you&apos;d pay $1,800 less over 12 months than the offer.
          </p>
        </div>

        <div aria-hidden className="flex h-11 items-center justify-center rounded-full bg-violet font-display text-[15px] font-medium text-paper">
          Write my message
        </div>
      </div>
      <figcaption className="sr-only">
        An example renewal from $1,950 to $2,100 a month, three listings our team checked by hand, and the suggested ask.
      </figcaption>
    </figure>
  );
}
