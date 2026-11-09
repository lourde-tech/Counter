import { describe, expect, it } from "vitest";
import { analyze } from "./compare";
import { buildMessage, citedListings, SIGN_OFF_PLACEHOLDER, tenurePhrase, TONES, wordCount, type TemplateInput } from "./templates";
import {
  LANDLORD_KINDS,
  PERKS,
  RenterInputSchema,
  type AskType,
  type CasePrep,
  type ChosenAsk,
  type Listing,
  type RenterInput,
} from "./types";

const TODAY = new Date(2026, 10, 9);

function listing(advertisedRent: number, label: string, overrides: Partial<Listing> = {}): Listing {
  return {
    label,
    beds: 1,
    baths: 1,
    advertisedRent,
    sourceName: "Zillow",
    url: "https://www.zillow.com/homedetails/example",
    checkedDate: "2026-11-02",
    checkedBy: "JW",
    ...overrides,
  };
}

const PREP: CasePrep = {
  caseCode: "C01",
  unit: { label: "Spruce St area, 1BR", beds: 1, baths: 1 },
  listings: [
    listing(1550, "Spruce St"),
    listing(1600, "S 22nd St", { sourceName: "Apartments.com" }),
    listing(1650, "Pine St", { sourceName: "Craigslist" }),
  ],
};

function renter(extra: Partial<RenterInput> = {}): RenterInput {
  return RenterInputSchema.parse({ currentRent: 1500, proposedRent: 1700, ...extra });
}

/** Builds the message for an ask the way the screens do: the number comes from analyze(). */
function message(type: AskType, r: RenterInput, tone: "friendly" | "direct" = "friendly", prep: CasePrep = PREP, perk?: ChosenAsk["perk"]) {
  const a = analyze(prep, r, TODAY);
  const option = a.options.find((o) => o.type === type);
  if (!option) throw new Error(`${type} not offered`);
  const input: TemplateInput = {
    ask: { type, perk },
    askRent: option.rent,
    tone,
    renter: r,
    unit: prep.unit,
    listings: prep.listings,
  };
  return { ...buildMessage(input), analysis: a };
}

function dollars(text: string): number[] {
  return [...text.matchAll(/\$([\d,]+(?:\.\d{2})?)/g)].map((m) => Number(m[1].replace(/,/g, "")));
}

const ALL_ASKS: AskType[] = ["keep_current", "meet_middle", "match_listings", "perk_instead", "general_inquiry"];

describe("every ask, tone and landlord kind", () => {
  const renters = [
    renter(),
    renter({ tenureMonths: 30, paidOnTime: true, landlordName: "Ms. Alvarez-Whitfield" }),
  ];

  for (const type of ALL_ASKS) {
    for (const tone of TONES) {
      for (const landlordKind of LANDLORD_KINDS) {
        for (const base of renters) {
          const r = { ...base, landlordKind };
          const label = `${type} / ${tone} / ${landlordKind} / ${base.tenureMonths ? "with record" : "plain"}`;

          it(`${label}: under 160 words, one closing question, only real numbers`, () => {
            const { subject, body, analysis } = message(type, r, tone, PREP, "parking_storage");
            expect(subject.length).toBeGreaterThan(0);
            expect(wordCount(body)).toBeLessThan(160);

            // The paragraph before the sign-off ends with a question.
            const paragraphs = body.split("\n\n");
            expect(paragraphs.at(-1)).toContain(SIGN_OFF_PLACEHOLDER);
            expect(paragraphs.at(-2)?.trim().endsWith("?")).toBe(true);

            // Every dollar figure is the renter's own number, the ask, or a listing.
            const allowed = new Set([
              r.currentRent,
              r.proposedRent,
              ...analysis.options.map((o) => o.rent ?? -1),
              ...PREP.listings.map((l) => l.advertisedRent),
            ]);
            for (const n of dollars(body)) expect(allowed.has(n)).toBe(true);

            // No legal claims, threats, tools or promises.
            for (const word of ["legal", "lawyer", "attorney", "court", " sue", "guarantee", "counter", " app", " ai ", "tool", "report you", "or else"]) {
              expect(body.toLowerCase()).not.toContain(word);
            }
          });
        }
      }
    }
  }
});

describe("listings in the message", () => {
  it("cites listings in the exact format, cheapest first", () => {
    const { body } = message("keep_current", renter());
    expect(body).toContain(
      "a 1BR/1BA on Spruce St advertised at $1,550 on Zillow, a 1BR/1BA on S 22nd St advertised at $1,600 on Apartments.com and a 1BR/1BA on Pine St advertised at $1,650 on Craigslist",
    );
  });

  it("only cites same-bedroom listings below the new rent, at most 3", () => {
    const listings = [
      listing(1500, "A St"),
      listing(1450, "B St", { beds: 2 }),
      listing(1800, "C St"),
      listing(1520, "D St"),
    ];
    const cited = citedListings(PREP.unit, listings, 1700);
    expect(cited.map((l) => l.label)).toEqual(["A St", "D St"]);
  });

  it("leaves listings out when none are below the new rent", () => {
    const prep = { ...PREP, listings: [listing(1800, "A St"), listing(1850, "B St"), listing(1900, "C St")] };
    const { body } = message("keep_current", renter(), "friendly", prep);
    expect(body).not.toContain("advertised");
  });

  it("company landlords: leads with the listings", () => {
    const { body } = message("meet_middle", renter({ landlordKind: "company" }));
    expect(body.indexOf("advertised at")).toBeLessThan(body.indexOf("I'd like to stay"));
  });

  it("person landlords: leads with wanting to stay", () => {
    for (const landlordKind of ["person", "unsure"] as const) {
      const { body } = message("meet_middle", renter({ landlordKind }));
      expect(body.indexOf("I'd like to stay")).toBeLessThan(body.indexOf("advertised at"));
    }
  });
});

describe("general_inquiry", () => {
  for (const tone of TONES) {
    it(`${tone}: no numbers, no listings; asks how the rent was set, about flexibility and for time`, () => {
      const { body } = message("general_inquiry", renter({ tenureMonths: 24 }), tone);
      expect(body).not.toContain("$");
      expect(body).not.toContain("advertised");
      expect(body).toContain("I'd like to stay");
      expect(body).toMatch(/how (was )?the new rent (was )?set/i);
      expect(body).toContain("flexibility on the amount or the lease terms");
      expect(body).toContain("before the renewal deadline?");
    });
  }

  it("skips 'how the new rent was set' when there is no increase", () => {
    const { body } = message("general_inquiry", renter({ currentRent: 1700, proposedRent: 1700 }));
    expect(body).not.toContain("new rent");
    expect(body).toContain("flexibility on the lease terms");
  });
});

describe("tenure and on-time payment", () => {
  it("are left out unless provided", () => {
    const { body } = message("keep_current", renter());
    expect(body).not.toContain("lived here for");
    expect(body).not.toContain("on time");
  });

  it("are included when provided", () => {
    const { body } = message("keep_current", renter({ tenureMonths: 24, paidOnTime: true }));
    expect(body).toContain("I've lived here for 2 years and paid rent on time every month.");
  });

  it("never mention late payment", () => {
    const { body } = message("keep_current", renter({ paidOnTime: false }));
    expect(body).not.toContain("on time");
  });

  it("never rounds tenure up", () => {
    expect(tenurePhrase(8)).toBe("8 months");
    expect(tenurePhrase(12)).toBe("1 year");
    expect(tenurePhrase(30)).toBe("over 2 years");
    expect(tenurePhrase(0)).toBeNull();
  });
});

describe("ask details", () => {
  it("keep_current names the current rent and the offer", () => {
    const { body } = message("keep_current", renter());
    expect(body).toContain("renew at my current rent of $1,500 instead of $1,700");
  });

  it("meet_middle says 'about halfway' when rounding moved the number", () => {
    const exact = message("meet_middle", renter()).body; // 1600 is exactly halfway
    expect(exact).toContain("$1,600 a month, halfway between");
    const rounded = message("meet_middle", renter({ currentRent: 1487, proposedRent: 1600 })).body;
    expect(rounded).toContain("$1,545 a month, about halfway between");
  });

  it("perk_instead keeps the offered rent and names the perk", () => {
    for (const perk of PERKS) {
      const { body } = message("perk_instead", renter(), "direct", PREP, perk);
      expect(body).toContain("renew at the offered rent of $1,700 if");
    }
  });

  it("greets the landlord by name only when given", () => {
    expect(message("keep_current", renter({ landlordName: "Dana" })).body.startsWith("Hi Dana,")).toBe(true);
    expect(message("keep_current", renter(), "direct").body.startsWith("Hello,")).toBe(true);
  });

  it("median at or below current: the suggested keep_current message still cites the listings", () => {
    const prep = { ...PREP, listings: [listing(1450, "A St"), listing(1500, "B St"), listing(1550, "C St")] };
    const { body, analysis } = message("keep_current", renter({ currentRent: 1600 }), "friendly", prep);
    expect(analysis.suggestedAsk).toBe("keep_current");
    expect(body).toContain("renew at my current rent of $1,600 instead of $1,700");
    expect(body).toContain("advertised at $1,500");
  });
});
