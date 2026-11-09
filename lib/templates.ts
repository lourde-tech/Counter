import type { ChosenAsk, Listing, Perk, RenterInput, Unit } from "./types";
import { formatMoney, joinLabels, listingName, plural } from "./format";

/*
 * Message templates. Two tones per ask type. Every number and listing is
 * inserted from data; nothing is invented. No legal claims, no threats, and no
 * mention of any tool. The renter edits the result before sending it.
 */

export type Tone = "friendly" | "direct";
export const TONES: Tone[] = ["friendly", "direct"];

export interface Message {
  subject: string;
  body: string;
}

/** The renter fills this in. The editor reminds them if it's still there. */
export const SIGN_OFF_PLACEHOLDER = "[Your name and unit]";

export const MAX_CITED = 3;

export interface TemplateInput {
  ask: ChosenAsk;
  /** The rent this ask names (from the ask options). null for general_inquiry. */
  askRent: number | null;
  tone: Tone;
  renter: RenterInput;
  unit: Unit;
  listings: Listing[];
}

/**
 * Listings the message may cite: same bedroom count as the renter's unit and
 * advertised below the new rent, cheapest first, at most 3.
 */
export function citedListings(unit: Unit, listings: Listing[], proposedRent: number): Listing[] {
  return listings
    .filter((l) => l.beds === unit.beds && l.advertisedRent < proposedRent)
    .sort((a, b) => a.advertisedRent - b.advertisedRent)
    .slice(0, MAX_CITED);
}

/** "a 2BR/1BA on Spruce St advertised at $1,650 on Zillow" */
export function citeListing(l: Listing): string {
  return `a ${listingName(l)} advertised at ${formatMoney(l.advertisedRent)} on ${l.sourceName}`;
}

/** 8 -> "8 months", 24 -> "2 years", 30 -> "over 2 years". Never rounds up. */
export function tenurePhrase(months: number | undefined): string | null {
  if (months === undefined || months < 1) return null;
  if (months < 12) return plural(months, "month");
  const years = Math.floor(months / 12);
  return months % 12 === 0 ? plural(years, "year") : `over ${plural(years, "year")}`;
}

/** Only what the renter told us. paidOnTime === false is never mentioned. */
function recordSentence(renter: RenterInput): string | null {
  const tenure = tenurePhrase(renter.tenureMonths);
  const onTime = renter.paidOnTime === true;
  if (tenure && onTime) return `I've lived here for ${tenure} and paid rent on time every month.`;
  if (tenure) return `I've lived here for ${tenure}.`;
  if (onTime) return "I've paid rent on time every month.";
  return null;
}

const PERK_CLAUSES: Record<Perk, string> = {
  parking_storage: "a parking spot or storage space could be included",
  waived_fee: "one of the fees on my lease could be waived",
  longer_lease: "we could keep this rate for a longer lease",
  repair_upgrade: "a repair or upgrade in my unit could be taken care of",
  move_out_flexibility: "the lease could include some flexibility on move-out",
};

function sentences(...parts: (string | null | false | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

interface AskParts {
  ask: string;
  question: string;
}

function askParts(input: TemplateInput, hasCited: boolean): AskParts {
  const { ask, askRent, tone, renter } = input;
  const friendly = tone === "friendly";
  const cur = formatMoney(renter.currentRent);
  const prop = formatMoney(renter.proposedRent);
  const rent = askRent === null ? "" : formatMoney(askRent);
  const agree = "Can we agree on that?";

  switch (ask.type) {
    case "keep_current":
      return friendly
        ? { ask: `I'd like to ask whether I could renew at my current rent of ${cur} instead of ${prop}.`, question: "Would you be open to that?" }
        : { ask: `I'm asking to renew at my current rent of ${cur}.`, question: agree };

    case "meet_middle": {
      const exact = askRent !== null && askRent * 2 === renter.currentRent + renter.proposedRent;
      const halfway = exact ? "halfway" : "about halfway";
      return friendly
        ? { ask: `I'd like to suggest meeting in the middle at ${rent} a month, ${halfway} between my current rent of ${cur} and the new rent of ${prop}.`, question: "Would that work for you?" }
        : { ask: `I'm proposing ${rent} a month, ${halfway} between my current rent of ${cur} and the new rent of ${prop}.`, question: agree };
    }

    case "match_listings": {
      const basis = hasCited ? "in line with those listings" : "in line with similar listings nearby";
      return friendly
        ? { ask: `I'd like to ask whether we could renew at ${rent} a month, ${basis}.`, question: "Would you be open to that?" }
        : { ask: `I'm asking to renew at ${rent} a month, ${basis}.`, question: agree };
    }

    case "perk_instead": {
      const clause = ask.perk ? PERK_CLAUSES[ask.perk] : "we could discuss one change to the lease terms";
      return friendly
        ? { ask: `I'm happy to renew at the offered rent of ${prop} if ${clause}.`, question: "Would you be open to that?" }
        : { ask: `I'm ready to renew at the offered rent of ${prop} if ${clause}.`, question: agree };
    }

    case "general_inquiry":
      // Handled separately: no numbers, no listings.
      return { ask: "", question: "" };
  }
}

function generalInquiry(input: TemplateInput): string[] {
  const { tone, renter } = input;
  const friendly = tone === "friendly";
  const hasIncrease = renter.proposedRent > renter.currentRent;

  const opener = friendly
    ? sentences("Thank you for sending the renewal offer.", "I've really liked living here and I'd like to stay.", recordSentence(renter))
    : sentences("I'm writing about my renewal offer.", "I'd like to stay.", recordSentence(renter));

  const questions = friendly
    ? hasIncrease
      ? "Before I decide, could you tell me how the new rent was set? I'd also like to know whether there's any flexibility on the amount or the lease terms."
      : "Before I sign, I'd like to know whether there's any flexibility on the lease terms."
    : hasIncrease
      ? "How was the new rent set? Is there flexibility on the amount or the lease terms?"
      : "Is there flexibility on the lease terms?";

  const closing = friendly
    ? "Could we find a time to talk before the renewal deadline?"
    : "Can we set a time to discuss this before the renewal deadline?";

  return [opener, questions, closing];
}

export function subjectFor(ask: ChosenAsk, tone: Tone): string {
  if (ask.type === "general_inquiry") {
    return tone === "friendly" ? "Question about my lease renewal" : "Lease renewal question";
  }
  return tone === "friendly" ? "About my lease renewal" : "Lease renewal request";
}

export function buildMessage(input: TemplateInput): Message {
  const { tone, renter } = input;
  const friendly = tone === "friendly";

  const name = renter.landlordName?.trim();
  const greeting = `${friendly ? "Hi" : "Hello"}${name ? ` ${name}` : ""},`;
  const signOff = `${friendly ? "Thanks so much," : "Thank you,"}\n${SIGN_OFF_PLACEHOLDER}`;

  let paragraphs: string[];

  if (input.ask.type === "general_inquiry") {
    paragraphs = generalInquiry(input);
  } else {
    const cited = citedListings(input.unit, input.listings, renter.proposedRent);
    const list = joinLabels(cited.map(citeListing));
    const evidence =
      cited.length === 0
        ? null
        : friendly
          ? `Before deciding, I looked at similar listings nearby: ${list}.`
          : `Similar listings nearby are advertised for less than the new rent: ${list}.`;

    const opener = friendly ? "Thank you for sending the renewal offer." : "I'm writing about my renewal offer.";
    const stay = friendly ? "I've really liked living here and I'd like to stay." : "I'd like to stay.";
    const record = recordSentence(renter);
    const { ask, question } = askParts(input, cited.length > 0);

    if (renter.landlordKind === "company" && evidence) {
      // Company landlords: lead with the listings.
      paragraphs = [sentences(opener, evidence), sentences(stay, record), sentences(ask, question)];
    } else {
      // Person (or unsure): lead with wanting to stay.
      paragraphs = [sentences(opener, stay, record), ...(evidence ? [evidence] : []), sentences(ask, question)];
    }
  }

  return {
    subject: subjectFor(input.ask, tone),
    body: [greeting, ...paragraphs, signOff].join("\n\n"),
  };
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
