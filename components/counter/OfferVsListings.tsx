"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { RentRange } from "@/lib/compare";
import { formatMoney } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { card, figure } from "./styles";

interface Props {
  current: number;
  proposed: number;
  listings: Listing[];
  range: RentRange | null;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Horizontal dot plot: listings are mist dots, current rent an ink tick, the new rent an ember tick. */
export default function OfferVsListings({ current, proposed, listings, range }: Props) {
  const reduce = useReducedMotion();
  const rents = listings.map((l) => l.advertisedRent);
  const values = [current, proposed, ...rents];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo;
  const pad = span === 0 ? Math.max(50, lo * 0.05) : span * 0.12;
  const x = (v: number) => ((v - (lo - pad)) / (span + 2 * pad)) * 100;

  const summary = [
    `You pay ${formatMoney(current)} now. The new rent is ${formatMoney(proposed)}.`,
    rents.length > 0
      ? `Listings our team found: ${rents.map((r) => formatMoney(r)).join(", ")}.`
      : "No listings to compare.",
  ].join(" ");

  return (
    <section className={card} aria-label="Your offer compared with the listings">
      <h2 className="text-sm font-medium text-slate">Your offer vs. the listings</h2>

      <div className="relative mt-4 h-28" role="img" aria-label={summary}>
        <div className="absolute inset-x-0 top-1/2 h-px bg-line" />

        <Tick x={x(current)} color="bg-ink" label="Now" value={current} side="above" />
        <Tick x={x(proposed)} color="bg-ember" label="New" value={proposed} side="below" />

        {listings.map((l, i) => (
          <span
            key={`${l.label}-${i}`}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x(l.advertisedRent)}%` }}
          >
            <motion.span
              className="block size-3.5 rounded-full bg-mist ring-2 ring-white"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.3, ease: EASE }}
            />
          </span>
        ))}

        {listings.length === 0 && (
          <p className="absolute inset-x-0 bottom-0 text-center text-xs text-slate">No listings to plot.</p>
        )}
      </div>

      <ul className="mt-4 space-y-2 text-sm text-slate">
        {range && (
          <li className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-full bg-mist" aria-hidden />
            {listings.length === 1 ? (
              <span>
                The listing our team found: <span className={`${figure} text-ink`}>{formatMoney(range.min)}</span>
              </span>
            ) : (
              <span>
                Listings our team found: <span className={`${figure} text-ink`}>{formatMoney(range.min)}</span> to{" "}
                <span className={`${figure} text-ink`}>{formatMoney(range.max)}</span>
              </span>
            )}
          </li>
        )}
        {range && listings.length > 1 && (
          <li className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-full border-2 border-mist" aria-hidden />
            <span>
              Middle of the listings: <span className={`${figure} text-ink`}>{formatMoney(range.median)}</span>
            </span>
          </li>
        )}
        <li className="flex items-center gap-2">
          <span className="ml-[5px] mr-[5px] h-3.5 w-0.5 shrink-0 bg-ink" aria-hidden />
          <span>
            What you pay now: <span className={`${figure} text-ink`}>{formatMoney(current)}</span>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="ml-[5px] mr-[5px] h-3.5 w-0.5 shrink-0 bg-ember" aria-hidden />
          <span>
            New rent: <span className={`${figure} text-ink`}>{formatMoney(proposed)}</span>
          </span>
        </li>
      </ul>
    </section>
  );
}

function Tick({ x, color, label, value, side }: { x: number; color: string; label: string; value: number; side: "above" | "below" }) {
  // Keep labels inside the card near the edges.
  const shift = x < 18 ? "0%" : x > 82 ? "-100%" : "-50%";
  return (
    <>
      <span className={`absolute top-1/2 h-7 w-0.5 -translate-x-1/2 -translate-y-1/2 ${color}`} style={{ left: `${x}%` }} />
      <span
        className={`absolute whitespace-nowrap text-xs ${side === "above" ? "top-0" : "bottom-0"}`}
        style={{ left: `${x}%`, transform: `translateX(${shift})` }}
      >
        <span className="text-slate">{label} </span>
        <span className={`${figure} font-medium ${side === "below" ? "text-ember" : "text-ink"}`}>{formatMoney(value)}</span>
      </span>
    </>
  );
}
