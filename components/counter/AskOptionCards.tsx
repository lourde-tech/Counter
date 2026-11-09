"use client";

import { useId } from "react";
import type { AskOption } from "@/lib/compare";
import { formatMoney } from "@/lib/format";
import { ASK_LABELS, PERK_LABELS, PERKS, type AskType, type ChosenAsk, type Perk, type RenterInput } from "@/lib/types";
import { figure } from "./styles";

interface Props {
  options: AskOption[];
  selected: ChosenAsk | null;
  onSelect: (ask: ChosenAsk) => void;
  renter: RenterInput;
  suggestedAsk: AskType | null;
  suggestionReason: string | null;
}

function description(type: AskType, renter: RenterInput): string {
  switch (type) {
    case "keep_current":
      return "Ask to renew at what you pay now.";
    case "meet_middle":
      return "Halfway between what you pay now and the new rent, rounded to the nearest $5.";
    case "match_listings":
      return "The middle of the listings our team found, rounded to the nearest $5.";
    case "perk_instead":
      return `Renew at ${formatMoney(renter.proposedRent)} and ask for one thing in return.`;
    case "general_inquiry":
      return "Ask how the new rent was set and whether there's room on the amount or terms. No number.";
  }
}

/** Radio cards. Each rent option shows the "if your landlord agrees" savings line. */
export default function AskOptionCards({ options, selected, onSelect, renter, suggestedAsk, suggestionReason }: Props) {
  const name = useId();
  const perkName = useId();

  return (
    <fieldset>
      <legend className="sr-only">What do you want to ask for?</legend>
      <div className="space-y-3">
        {options.map((o) => {
          const checked = selected?.type === o.type;
          const suggested = suggestedAsk === o.type;
          const showRent = o.rent !== null && o.type !== "perk_instead";
          return (
            <div
              key={o.type}
              className={`rounded-2xl border transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-violet-deep ${
                checked ? "border-violet bg-lavender ring-1 ring-violet" : "border-ink bg-paper hover:bg-lavender"
              }`}
            >
              <label className="flex cursor-pointer gap-3 p-5">
                <input
                  type="radio"
                  name={name}
                  value={o.type}
                  checked={checked}
                  onChange={() => onSelect({ type: o.type, perk: o.type === "perk_instead" ? selected?.perk : undefined })}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    checked ? "border-violet" : "border-ink"
                  }`}
                >
                  {checked && <span className="size-2.5 rounded-full bg-violet" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="font-display font-medium">{ASK_LABELS[o.type]}</span>
                    {showRent && (
                      <span className={`${figure} text-lg font-semibold`}>
                        {formatMoney(o.rent!)}
                        <span className="text-[13px] font-medium text-ink">/mo</span>
                      </span>
                    )}
                  </span>
                  {suggested && (
                    <span className="mt-2 inline-block rounded-full bg-ink px-2.5 py-0.5 font-display text-[13px] font-medium text-paper">
                      Suggested
                    </span>
                  )}
                  <span className="mt-1.5 block text-sm text-ink">{description(o.type, renter)}</span>
                  {suggested && suggestionReason && <span className="mt-1.5 block text-sm text-ink">{suggestionReason}</span>}
                  {o.savingsLine && <span className="mt-2 block text-sm text-ink">{o.savingsLine}</span>}
                </span>
              </label>

              {o.type === "perk_instead" && checked && (
                <fieldset className="border-t border-ink px-5 pt-4 pb-5">
                  <legend className="float-left mb-2 w-full text-sm font-medium">Pick one perk</legend>
                  <div className="clear-left flex flex-wrap gap-2">
                    {PERKS.map((perk: Perk) => {
                      const on = selected?.perk === perk;
                      return (
                        <label
                          key={perk}
                          className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 font-display text-sm font-medium transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-violet-deep ${
                            on ? "border-violet bg-violet text-paper" : "border-ink bg-paper hover:bg-lavender"
                          }`}
                        >
                          <input
                            type="radio"
                            name={perkName}
                            value={perk}
                            checked={on}
                            onChange={() => onSelect({ type: "perk_instead", perk })}
                            className="sr-only"
                          />
                          {PERK_LABELS[perk]}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
