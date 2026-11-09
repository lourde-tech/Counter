import type { AskType, CasePrep, Listing, RenterInput, Unit } from "./types";
import { formatMoney, joinLabels, plural, roundCents } from "./format";

/*
 * Pure comparison logic. No I/O, no randomness, no scores, no recommendations.
 * Every number shown to the renter comes either from the renter's own input
 * or from a listing our team verified by hand.
 */

export const MIN_LISTINGS = 3;
export const STALE_AFTER_DAYS = 21;
export const WIDE_SPREAD_RATIO = 0.25;

/* ------------------------------------------------------------------ */
/* The increase                                                        */
/* ------------------------------------------------------------------ */

export interface Increase {
  current: number;
  proposed: number;
  /** proposed - current (negative when the new rent is lower) */
  amount: number;
  /** amount / current */
  pct: number;
  leaseMonths: number;
  /** amount * leaseMonths */
  overLease: number;
  hasIncrease: boolean;
}

export function getIncrease(renter: Pick<RenterInput, "currentRent" | "proposedRent" | "leaseMonths">): Increase {
  const { currentRent: current, proposedRent: proposed, leaseMonths } = renter;
  const amount = roundCents(proposed - current);
  return {
    current,
    proposed,
    amount,
    pct: amount / current,
    leaseMonths,
    overLease: roundCents(amount * leaseMonths),
    hasIncrease: amount > 0,
  };
}

/* ------------------------------------------------------------------ */
/* Listings                                                            */
/* ------------------------------------------------------------------ */

export interface ListingComparison {
  listing: Listing;
  /** proposed - advertisedRent. Positive means the offer is above this listing. */
  diff: number;
  /** diff / advertisedRent */
  diffPct: number;
}

export function compareListings(proposed: number, listings: Listing[]): ListingComparison[] {
  return listings.map((listing) => {
    const diff = roundCents(proposed - listing.advertisedRent);
    return { listing, diff, diffPct: diff / listing.advertisedRent };
  });
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : roundCents((sorted[mid - 1] + sorted[mid]) / 2);
}

export interface RentRange {
  min: number;
  max: number;
  median: number;
}

export function rentRange(listings: Listing[]): RentRange | null {
  const rents = listings.map((l) => l.advertisedRent);
  const mid = median(rents);
  if (mid === null) return null;
  return { min: Math.min(...rents), max: Math.max(...rents), median: mid };
}

export type Position = "above_all" | "within" | "below_all" | "unknown";

/** Where the proposed rent sits against the listing rents. Ties count as within. */
export function getPosition(proposed: number, listings: Listing[]): Position {
  const range = rentRange(listings);
  if (!range) return "unknown";
  if (proposed > range.max) return "above_all";
  if (proposed < range.min) return "below_all";
  return "within";
}

/** One plain sentence (two for below_all) describing the position. No scores, no odds. */
export function positionSentence(position: Position, range: RentRange | null): string {
  switch (position) {
    case "above_all":
      return "The new rent is above every listing we found.";
    case "below_all":
      return "The new rent is below every listing we found. Asking about terms may land better than asking for a lower number.";
    case "within":
      if (range && range.min === range.max) {
        return `The new rent matches the listing we found, ${formatMoney(range.min)}.`;
      }
      return range
        ? `The new rent is within the range of listings we found, ${formatMoney(range.min)} to ${formatMoney(range.max)}.`
        : "The new rent is within the range of listings we found.";
    case "unknown":
      return "We don't have verified listings to compare the new rent against.";
  }
}

/* ------------------------------------------------------------------ */
/* Thin evidence                                                       */
/* ------------------------------------------------------------------ */

export type ThinFlagCode = "few_listings" | "beds_mismatch" | "stale_listing" | "wide_spread";

export interface ThinFlag {
  code: ThinFlagCode;
  /** A plain sentence shown to the renter. */
  message: string;
}

/** Whole calendar days from a YYYY-MM-DD date to `today` (in the viewer's local calendar). */
export function daysSince(isoDate: string, today: Date): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const then = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((now - then) / 86_400_000);
}

function someListings(n: number): string {
  return n === 1 ? "One listing" : `${n} listings`;
}

/** Each flag that fires, in a fixed order. An empty array means the evidence is not thin. */
export function thinEvidence(unit: Unit, listings: Listing[], today: Date = new Date()): ThinFlag[] {
  const flags: ThinFlag[] = [];

  if (listings.length === 0) {
    flags.push({
      code: "few_listings",
      message: "We couldn't verify any nearby listings for your unit.",
    });
  } else if (listings.length < MIN_LISTINGS) {
    flags.push({
      code: "few_listings",
      message: `We verified only ${plural(listings.length, "listing")}, fewer than the ${MIN_LISTINGS} we aim for.`,
    });
  }

  const mismatched = listings.filter((l) => l.beds !== unit.beds);
  if (mismatched.length > 0) {
    const verb = mismatched.length === 1 ? "has" : "have";
    flags.push({
      code: "beds_mismatch",
      message: `${someListings(mismatched.length)} ${verb} a different number of bedrooms than your unit: ${joinLabels(mismatched.map((l) => l.label))}.`,
    });
  }

  const stale = listings.filter((l) => daysSince(l.checkedDate, today) > STALE_AFTER_DAYS);
  if (stale.length > 0) {
    const verb = stale.length === 1 ? "was" : "were";
    flags.push({
      code: "stale_listing",
      message: `${someListings(stale.length)} ${verb} checked more than ${STALE_AFTER_DAYS} days ago and may have changed: ${joinLabels(stale.map((l) => l.label))}.`,
    });
  }

  const range = rentRange(listings);
  if (range && (range.max - range.min) / range.median > WIDE_SPREAD_RATIO) {
    flags.push({
      code: "wide_spread",
      message: `The listings range from ${formatMoney(range.min)} to ${formatMoney(range.max)}, which is a wide spread.`,
    });
  }

  return flags;
}

/* ------------------------------------------------------------------ */
/* Ask options                                                         */
/* ------------------------------------------------------------------ */

export function roundTo5(n: number): number {
  return Math.round(n / 5) * 5;
}

export interface AskOption {
  type: AskType;
  /** The monthly rent this ask names. null for general_inquiry. */
  rent: number | null;
  /** proposed - rent, per month. null when the ask names no lower rent. */
  monthlySavings: number | null;
  /** monthlySavings * leaseMonths */
  totalSavings: number | null;
  /** "If your landlord agrees, you'd pay $X less over N months than the offer." */
  savingsLine: string | null;
}

export interface AskOptions {
  options: AskOption[];
  /** Pre-selected option. Only ever general_inquiry; otherwise the renter chooses with nothing selected. */
  defaultAsk: AskType | null;
}

export function savingsLine(totalSavings: number, leaseMonths: number): string {
  return `If your landlord agrees, you'd pay ${formatMoney(totalSavings)} less over ${plural(leaseMonths, "month")} than the offer.`;
}

function rentOption(type: AskType, rent: number, renter: RenterInput): AskOption {
  const monthly = roundCents(renter.proposedRent - rent);
  const total = roundCents(monthly * renter.leaseMonths);
  return {
    type,
    rent,
    monthlySavings: monthly,
    totalSavings: total,
    savingsLine: savingsLine(total, renter.leaseMonths),
  };
}

/**
 * The asks the renter can choose from. We make no recommendation and give no score.
 * Options whose number would equal the offer (or duplicate keeping the current rent)
 * are left out, because they wouldn't be asking for anything.
 */
export function askOptions(
  renter: RenterInput,
  evidence: { median: number | null; isThin: boolean },
): AskOptions {
  const inc = getIncrease(renter);
  const options: AskOption[] = [];

  if (inc.hasIncrease) {
    options.push(rentOption("keep_current", inc.current, renter));

    const middle = roundTo5(inc.current + inc.amount / 2);
    if (middle > inc.current && middle < inc.proposed) {
      options.push(rentOption("meet_middle", middle, renter));
    }
  }

  if (!evidence.isThin && evidence.median !== null) {
    const match = roundTo5(evidence.median);
    if (match < inc.proposed) {
      options.push(rentOption("match_listings", match, renter));
    }
  }

  options.push({
    type: "perk_instead",
    rent: inc.proposed,
    monthlySavings: null,
    totalSavings: null,
    savingsLine: null,
  });

  options.push({
    type: "general_inquiry",
    rent: null,
    monthlySavings: null,
    totalSavings: null,
    savingsLine: null,
  });

  const defaultAsk: AskType | null = evidence.isThin || !inc.hasIncrease ? "general_inquiry" : null;
  return { options, defaultAsk };
}

/* ------------------------------------------------------------------ */
/* Everything the screens need, in one call                            */
/* ------------------------------------------------------------------ */

export interface Analysis {
  increase: Increase;
  listings: ListingComparison[];
  range: RentRange | null;
  position: Position;
  positionSentence: string;
  thinFlags: ThinFlag[];
  isThin: boolean;
  options: AskOption[];
  defaultAsk: AskType | null;
}

export function analyze(prep: CasePrep, renter: RenterInput, today: Date = new Date()): Analysis {
  const range = rentRange(prep.listings);
  const position = getPosition(renter.proposedRent, prep.listings);
  const thinFlags = thinEvidence(prep.unit, prep.listings, today);
  const isThin = thinFlags.length > 0;
  const { options, defaultAsk } = askOptions(renter, { median: range?.median ?? null, isThin });

  return {
    increase: getIncrease(renter),
    listings: compareListings(renter.proposedRent, prep.listings),
    range,
    position,
    positionSentence: positionSentence(position, range),
    thinFlags,
    isThin,
    options,
    defaultAsk,
  };
}
