import { RenterInputSchema, type LandlordKind, type RenterInput } from "./types";

/** What the "Your offer" form holds while the renter types. Strings, so nothing is coerced early. */
export interface OfferDraft {
  currentRent: string;
  proposedRent: string;
  leaseMonths: string;
  tenureYears: string;
  tenureMonths: string;
  paidOnTime: "yes" | "no" | "skip";
  landlordName: string;
  landlordKind: LandlordKind;
}

export const EMPTY_OFFER: OfferDraft = {
  currentRent: "",
  proposedRent: "",
  leaseMonths: "12",
  tenureYears: "",
  tenureMonths: "",
  paidOnTime: "skip",
  landlordName: "",
  landlordKind: "unsure",
};

export type OfferErrors = Partial<Record<keyof OfferDraft, string>>;

/** "$1,650" / "1650.50" -> number, "" -> null, junk -> NaN. */
export function parseMoney(text: string): number | null {
  const cleaned = text.replace(/[$,\s]/g, "");
  if (cleaned === "") return null;
  return /^\d+(\.\d{1,2})?$/.test(cleaned) ? Number(cleaned) : NaN;
}

function parseWhole(text: string): number | null {
  const t = text.trim();
  if (t === "") return null;
  return /^\d+$/.test(t) ? Number(t) : NaN;
}

function rentError(value: number | null, emptyMessage: string): string | undefined {
  if (value === null) return emptyMessage;
  if (Number.isNaN(value)) return "Enter a dollar amount, like 1,650.";
  if (value <= 0) return "Enter an amount above $0.";
  if (value > 20_000) return "That looks too high. Check for a typo.";
  return undefined;
}

export function validateOffer(draft: OfferDraft): { renter: RenterInput | null; errors: OfferErrors } {
  const errors: OfferErrors = {};

  const current = parseMoney(draft.currentRent);
  const proposed = parseMoney(draft.proposedRent);
  const lease = parseWhole(draft.leaseMonths);
  const years = parseWhole(draft.tenureYears);
  const months = parseWhole(draft.tenureMonths);

  errors.currentRent = rentError(current, "Enter what you pay now.");
  errors.proposedRent = rentError(proposed, "Enter the new rent from your renewal offer.");
  if (lease === null || Number.isNaN(lease) || lease < 1 || lease > 36) {
    errors.leaseMonths = "Enter the lease length in months, 1 to 36.";
  }
  if (years !== null && (Number.isNaN(years) || years > 50)) errors.tenureYears = "Whole years, 0 to 50.";
  if (months !== null && (Number.isNaN(months) || months > 11)) errors.tenureMonths = "Whole months, 0 to 11.";
  if (draft.landlordName.trim().length > 80) errors.landlordName = "Keep it under 80 characters.";

  for (const key of Object.keys(errors) as (keyof OfferDraft)[]) {
    if (errors[key] === undefined) delete errors[key];
  }
  if (Object.keys(errors).length > 0) return { renter: null, errors };

  const tenure = years === null && months === null ? undefined : (years ?? 0) * 12 + (months ?? 0);
  const parsed = RenterInputSchema.safeParse({
    currentRent: current,
    proposedRent: proposed,
    leaseMonths: lease,
    tenureMonths: tenure,
    paidOnTime: draft.paidOnTime === "skip" ? undefined : draft.paidOnTime === "yes",
    landlordName: draft.landlordName.trim() || undefined,
    landlordKind: draft.landlordKind,
  });
  return parsed.success ? { renter: parsed.data, errors } : { renter: null, errors: { currentRent: "Check your numbers." } };
}
