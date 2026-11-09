"use client";

import { useState } from "react";
import { parseMoney, validateOffer, type OfferDraft } from "@/lib/offer";
import type { LandlordKind, RenterInput } from "@/lib/types";
import Field from "./Field";
import Segmented from "./Segmented";
import StepHeading from "./StepHeading";
import { btnPrimary } from "./styles";

interface Props {
  draft: OfferDraft;
  onDraftChange: (draft: OfferDraft) => void;
  onContinue: (renter: RenterInput) => void;
}

export default function OfferStep({ draft, onDraftChange, onContinue }: Props) {
  const [tried, setTried] = useState(false);
  const { renter, errors } = validateOffer(draft);
  const shown = tried ? errors : {};

  const current = parseMoney(draft.currentRent);
  const proposed = parseMoney(draft.proposedRent);
  const noIncrease =
    current !== null && proposed !== null && !Number.isNaN(current) && !Number.isNaN(proposed) && current > 0 && proposed <= current;

  const set = <K extends keyof OfferDraft>(key: K) => (value: OfferDraft[K]) => onDraftChange({ ...draft, [key]: value });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (renter) onContinue(renter);
  }

  return (
    <form onSubmit={submit} noValidate>
      <StepHeading>Your offer</StepHeading>
      <p className="-mt-3 mb-6 text-ink">From your renewal letter or email. This stays on this page.</p>

      <div className="space-y-5">
        <Field
          label="What you pay now"
          prefix="$"
          suffix="/mo"
          inputMode="decimal"
          autoComplete="off"
          value={draft.currentRent}
          onValueChange={set("currentRent")}
          error={shown.currentRent}
        />
        <Field
          label="The new rent they're offering"
          prefix="$"
          suffix="/mo"
          inputMode="decimal"
          autoComplete="off"
          value={draft.proposedRent}
          onValueChange={set("proposedRent")}
          error={shown.proposedRent}
        />

        {noIncrease && (
          <p className="rounded-2xl border border-ink bg-paper p-4" role="status">
            No increase? You can still ask about terms.
          </p>
        )}

        <Field
          label="Lease length"
          suffix="months"
          inputMode="numeric"
          autoComplete="off"
          value={draft.leaseMonths}
          onValueChange={set("leaseMonths")}
          error={shown.leaseMonths}
          className="max-w-48"
        />
      </div>

      <div className="mt-10 border-t border-ink pt-6">
        <h2 className="font-display text-lg font-semibold">A bit more, if you want</h2>
        <p className="mt-1 text-sm text-ink">Optional. Only used to word your message.</p>

        <div className="mt-5 space-y-5">
          <fieldset>
            <legend className="block text-sm font-medium">How long have you lived here?</legend>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <Field
                label={<span className="sr-only">Years</span>}
                suffix="years"
                inputMode="numeric"
                autoComplete="off"
                value={draft.tenureYears}
                onValueChange={set("tenureYears")}
                error={shown.tenureYears}
              />
              <Field
                label={<span className="sr-only">Months</span>}
                suffix="months"
                inputMode="numeric"
                autoComplete="off"
                value={draft.tenureMonths}
                onValueChange={set("tenureMonths")}
                error={shown.tenureMonths}
              />
            </div>
          </fieldset>

          <Segmented<OfferDraft["paidOnTime"]>
            label="Have you paid rent on time every month?"
            value={draft.paidOnTime}
            onChange={set("paidOnTime")}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "Not always" },
              { value: "skip", label: "Skip" },
            ]}
          />

          <Field
            label="Landlord or property manager's name"
            hint="Only used to start your message, like “Hi Dana,”."
            autoComplete="off"
            value={draft.landlordName}
            onValueChange={set("landlordName")}
            error={shown.landlordName}
          />

          <Segmented<LandlordKind>
            label="Your landlord is"
            value={draft.landlordKind}
            onChange={set("landlordKind")}
            options={[
              { value: "person", label: "A person" },
              { value: "company", label: "A company" },
              { value: "unsure", label: "Not sure" },
            ]}
          />
        </div>
      </div>

      <div className="mt-10">
        <button type="submit" className={btnPrimary}>
          See the evidence
        </button>
        {tried && !renter && (
          <p className="mt-2 text-center text-sm text-violet-deep" role="alert">
            Check the fields marked above.
          </p>
        )}
      </div>
    </form>
  );
}
