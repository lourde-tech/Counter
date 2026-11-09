import { z } from "zod";

/*
 * Shared data shapes for the Counter demo.
 *
 * CasePrep is written by our team on /prep and travels to the renter inside the
 * URL hash. RenterInput and SessionState live only in React state in the
 * renter's browser. Nothing here is ever sent to a server.
 */

const requiredText = (max: number) =>
  z.string().trim().min(1, "Required").max(max, `Keep it under ${max} characters`);

const number = { error: "Enter a number" };

/** Bedrooms. 0 means a studio. */
const beds = z.number(number).int("Whole number, 0 for a studio").min(0, "0 to 8").max(8, "0 to 8");
/** Bathrooms in half steps (1, 1.5, 2 ...). */
const baths = z.number(number).min(0.5, "At least 0.5").max(6, "6 or fewer").multipleOf(0.5, "Use half steps, like 1 or 1.5");
/** Monthly rent in US dollars. The upper bound is only a typo guard. */
const rent = z.number(number).positive("Must be more than $0").max(20_000, "That looks too high. Check for a typo.");

export const UnitSchema = z.object({
  /** Street area plus unit type, never an exact address. e.g. "Spruce St area, 1BR" */
  label: requiredText(80),
  beds,
  baths,
});

export const ListingSchema = z.object({
  /**
   * Street or block only, e.g. "Spruce St". Beds and baths come from the
   * fields below, so the listing reads "a 2BR/1BA on Spruce St".
   */
  label: requiredText(40),
  beds,
  baths,
  /** The exact advertised rent, as listed. */
  advertisedRent: rent,
  /** e.g. "Zillow" */
  sourceName: requiredText(40),
  /** Only http(s) links, so a crafted link can't smuggle in javascript: URLs. */
  url: z.url({ protocol: /^https?$/, error: "Use a full http(s) link" }),
  /** YYYY-MM-DD */
  checkedDate: z.iso.date({ error: "Use a date like 2026-11-02" }),
  /** Initials of the team member who checked the listing. */
  checkedBy: requiredText(6),
});

export const MAX_LISTINGS = 3;

export const CasePrepSchema = z.object({
  /** e.g. "C01" */
  caseCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9-]{1,16}$/, "Letters, numbers and dashes only"),
  unit: UnitSchema,
  listings: z.array(ListingSchema).max(MAX_LISTINGS),
  teamNote: z.string().trim().max(400).optional(),
});

export const LANDLORD_KINDS = ["person", "company", "unsure"] as const;

export const RenterInputSchema = z.object({
  currentRent: rent,
  proposedRent: rent,
  leaseMonths: z.number().int().min(1).max(36).default(12),
  tenureMonths: z.number().int().min(0).max(600).optional(),
  paidOnTime: z.boolean().optional(),
  landlordName: z.string().trim().max(80).optional(),
  landlordKind: z.enum(LANDLORD_KINDS).default("unsure"),
});

export type Unit = z.infer<typeof UnitSchema>;
export type Listing = z.infer<typeof ListingSchema>;
export type CasePrep = z.infer<typeof CasePrepSchema>;
export type RenterInput = z.infer<typeof RenterInputSchema>;
export type LandlordKind = (typeof LANDLORD_KINDS)[number];

/* ------------------------------------------------------------------ */
/* Asks                                                                */
/* ------------------------------------------------------------------ */

export const ASK_TYPES = [
  "keep_current",
  "meet_middle",
  "match_listings",
  "perk_instead",
  "general_inquiry",
] as const;
export type AskType = (typeof ASK_TYPES)[number];

export const PERKS = [
  "parking_storage",
  "waived_fee",
  "longer_lease",
  "repair_upgrade",
  "move_out_flexibility",
] as const;
export type Perk = (typeof PERKS)[number];

export const PERK_LABELS: Record<Perk, string> = {
  parking_storage: "Parking or storage",
  waived_fee: "A waived fee",
  longer_lease: "A longer lease at this rate",
  repair_upgrade: "A repair or upgrade",
  move_out_flexibility: "Move-out flexibility",
};

export const ASK_LABELS: Record<AskType, string> = {
  keep_current: "Keep my current rent",
  meet_middle: "Meet in the middle",
  match_listings: "Match the listings",
  perk_instead: "Ask for a perk instead",
  general_inquiry: "Ask about the renewal, no number",
};

export interface ChosenAsk {
  type: AskType;
  /** Required when type is "perk_instead". */
  perk?: Perk;
}

/* ------------------------------------------------------------------ */
/* Decision and session                                                */
/* ------------------------------------------------------------------ */

export const DECISIONS = ["sent", "sending_later", "not_sending"] as const;
export type Decision = (typeof DECISIONS)[number];

export const DECISION_LABELS: Record<Decision, string> = {
  sent: "Sent it",
  sending_later: "Sending later",
  not_sending: "Not sending",
};

export const STOP_REASONS = [
  "wont_work",
  "relationship",
  "evidence",
  "in_person",
  "no_time",
  "other",
] as const;
export type StopReason = (typeof STOP_REASONS)[number];

export const STOP_REASON_LABELS: Record<StopReason, string> = {
  wont_work: "I don't think it'll work",
  relationship: "Worried about my landlord relationship",
  evidence: "The evidence didn't convince me",
  in_person: "I'd rather talk in person",
  no_time: "Ran out of time",
  other: "Other",
};

/** Kept in React state only. Never persisted, never sent anywhere. */
export interface SessionState {
  renter: RenterInput | null;
  ask: ChosenAsk | null;
  copied: boolean;
  emailOpened: boolean;
  edited: boolean;
  decision: Decision | null;
  stopReasons: StopReason[];
}

export const INITIAL_SESSION: SessionState = {
  renter: null,
  ask: null,
  copied: false,
  emailOpened: false,
  edited: false,
  decision: null,
  stopReasons: [],
};
