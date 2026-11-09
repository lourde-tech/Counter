import { describe, expect, it } from "vitest";
import {
  analyze,
  askOptions,
  compareListings,
  daysSince,
  getIncrease,
  getPosition,
  median,
  roundTo5,
  thinEvidence,
} from "./compare";
import { RenterInputSchema, type CasePrep, type Listing, type RenterInput } from "./types";

/* Fixtures ---------------------------------------------------------- */

// Local calendar date, matching how the renter's browser sees "today".
const TODAY = new Date(2026, 10, 9); // Nov 9, 2026

function listing(advertisedRent: number, overrides: Partial<Listing> = {}): Listing {
  return {
    label: `1BR/1BA at $${advertisedRent}`,
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

function prep(listings: Listing[]): CasePrep {
  return {
    caseCode: "C01",
    unit: { label: "Spruce St area, 1BR", beds: 1, baths: 1 },
    listings,
  };
}

function renter(currentRent: number, proposedRent: number, extra: Partial<RenterInput> = {}): RenterInput {
  return RenterInputSchema.parse({ currentRent, proposedRent, ...extra });
}

const types = (a: ReturnType<typeof analyze>) => a.options.map((o) => o.type);
const option = (a: ReturnType<typeof analyze>, t: string) => a.options.find((o) => o.type === t);

/* The increase ------------------------------------------------------ */

describe("getIncrease", () => {
  it("computes the amount, percent and lease total", () => {
    const inc = getIncrease(renter(1500, 1650));
    expect(inc.amount).toBe(150);
    expect(inc.pct).toBeCloseTo(0.1);
    expect(inc.overLease).toBe(1800);
    expect(inc.hasIncrease).toBe(true);
  });

  it("uses the lease length the renter gives", () => {
    expect(getIncrease(renter(1500, 1600, { leaseMonths: 18 })).overLease).toBe(1800);
  });

  it("keeps cents exact", () => {
    expect(getIncrease(renter(1487.3, 1500.5)).amount).toBe(13.2);
  });
});

/* Per-listing diffs, median, position ------------------------------- */

describe("compareListings", () => {
  it("gives proposed minus advertised rent, with a percent of the listing", () => {
    const [a, b] = compareListings(1700, [listing(1600), listing(1800)]);
    expect(a.diff).toBe(100);
    expect(a.diffPct).toBeCloseTo(0.0625);
    expect(b.diff).toBe(-100);
    expect(b.diffPct).toBeCloseTo(-0.0556, 3);
  });
});

describe("median", () => {
  it("handles odd, even and empty lists", () => {
    expect(median([1700, 1500, 1600])).toBe(1600);
    expect(median([1500, 1650])).toBe(1575);
    expect(median([])).toBeNull();
  });
});

describe("getPosition", () => {
  const ls = [listing(1500), listing(1600), listing(1700)];
  it("treats ties with the min or max as within", () => {
    expect(getPosition(1700, ls)).toBe("within");
    expect(getPosition(1500, ls)).toBe("within");
  });
  it("is unknown with no listings", () => {
    expect(getPosition(1700, [])).toBe("unknown");
  });
});

/* Required scenarios ------------------------------------------------ */

describe("above_all", () => {
  const a = analyze(prep([listing(1500), listing(1550), listing(1600)]), renter(1500, 1700), TODAY);

  it("places the offer above every listing", () => {
    expect(a.position).toBe("above_all");
    expect(a.positionSentence).toBe("The new rent is above every listing we found.");
    expect(a.range).toEqual({ min: 1500, max: 1600, median: 1550 });
  });

  it("is not thin and pre-selects nothing", () => {
    expect(a.thinFlags).toEqual([]);
    expect(a.isThin).toBe(false);
    expect(a.defaultAsk).toBeNull();
  });

  it("offers every ask with the right numbers", () => {
    expect(types(a)).toEqual(["keep_current", "meet_middle", "match_listings", "perk_instead", "general_inquiry"]);
    expect(option(a, "keep_current")).toMatchObject({ rent: 1500, monthlySavings: 200, totalSavings: 2400 });
    expect(option(a, "meet_middle")).toMatchObject({ rent: 1600, monthlySavings: 100, totalSavings: 1200 });
    expect(option(a, "match_listings")).toMatchObject({ rent: 1550, monthlySavings: 150, totalSavings: 1800 });
  });

  it("phrases every rent option as conditional on the landlord agreeing", () => {
    expect(option(a, "keep_current")?.savingsLine).toBe(
      "If your landlord agrees, you'd pay $2,400 less over 12 months than the offer.",
    );
    expect(option(a, "perk_instead")).toMatchObject({ rent: 1700, savingsLine: null });
    expect(option(a, "general_inquiry")).toMatchObject({ rent: null, savingsLine: null });
  });
});

describe("within", () => {
  const a = analyze(prep([listing(1550), listing(1650), listing(1800)]), renter(1550, 1700), TODAY);

  it("places the offer inside the listing range", () => {
    expect(a.position).toBe("within");
    expect(a.positionSentence).toBe("The new rent is within the range of listings we found, $1,550 to $1,800.");
  });

  it("offers match_listings only because the median is below the offer", () => {
    expect(a.isThin).toBe(false);
    expect(option(a, "match_listings")).toMatchObject({ rent: 1650, monthlySavings: 50 });
  });

  it("drops match_listings when the median is at or above the offer", () => {
    const b = analyze(prep([listing(1550), listing(1700), listing(1800)]), renter(1550, 1700), TODAY);
    expect(b.position).toBe("within");
    expect(types(b)).not.toContain("match_listings");
  });
});

describe("below_all", () => {
  const a = analyze(prep([listing(1800), listing(1850), listing(1900)]), renter(1600, 1700), TODAY);

  it("says asking about terms may land better", () => {
    expect(a.position).toBe("below_all");
    expect(a.positionSentence).toBe(
      "The new rent is below every listing we found. Asking about terms may land better than asking for a lower number.",
    );
  });

  it("never offers match_listings", () => {
    expect(types(a)).toEqual(["keep_current", "meet_middle", "perk_instead", "general_inquiry"]);
  });
});

describe("no increase", () => {
  const ls = [listing(1500), listing(1550), listing(1600)];

  it("defaults to general_inquiry and offers no keep/middle when the rent stays the same", () => {
    const a = analyze(prep(ls), renter(1600, 1600), TODAY);
    expect(a.increase.hasIncrease).toBe(false);
    expect(a.increase.amount).toBe(0);
    expect(a.defaultAsk).toBe("general_inquiry");
    expect(types(a)).not.toContain("keep_current");
    expect(types(a)).not.toContain("meet_middle");
    expect(types(a)).toContain("perk_instead");
    expect(types(a)).toContain("general_inquiry");
  });

  it("treats a lower proposed rent the same way", () => {
    const a = analyze(prep(ls), renter(1700, 1650), TODAY);
    expect(a.increase.amount).toBe(-50);
    expect(a.increase.hasIncrease).toBe(false);
    expect(a.defaultAsk).toBe("general_inquiry");
  });
});

describe("zero listings", () => {
  const a = analyze(prep([]), renter(1500, 1700), TODAY);

  it("has no position, range or listing comparisons", () => {
    expect(a.position).toBe("unknown");
    expect(a.range).toBeNull();
    expect(a.listings).toEqual([]);
    expect(a.positionSentence).toBe("We don't have verified listings to compare the new rent against.");
  });

  it("is thin and defaults to general_inquiry", () => {
    expect(a.thinFlags).toEqual([
      { code: "few_listings", message: "We couldn't verify any nearby listings for your unit." },
    ]);
    expect(a.defaultAsk).toBe("general_inquiry");
    expect(types(a)).not.toContain("match_listings");
  });

  it("still lets the renter choose a number based on their own rent", () => {
    expect(types(a)).toEqual(["keep_current", "meet_middle", "perk_instead", "general_inquiry"]);
  });
});

describe("one listing", () => {
  const a = analyze(prep([listing(1550)]), renter(1500, 1700), TODAY);

  it("is thin, with a plain sentence", () => {
    expect(a.thinFlags).toEqual([
      { code: "few_listings", message: "We verified only 1 listing, fewer than the 3 we aim for." },
    ]);
    expect(a.defaultAsk).toBe("general_inquiry");
  });

  it("still compares, but never offers match_listings", () => {
    expect(a.position).toBe("above_all");
    expect(a.range).toEqual({ min: 1550, max: 1550, median: 1550 });
    expect(types(a)).not.toContain("match_listings");
  });

  it("describes an exact match with a single listing", () => {
    expect(analyze(prep([listing(1700)]), renter(1500, 1700), TODAY).positionSentence).toBe(
      "The new rent matches the listing we found, $1,700.",
    );
  });

  it("counts two listings as thin too", () => {
    const b = analyze(prep([listing(1550), listing(1600)]), renter(1500, 1700), TODAY);
    expect(b.thinFlags.map((f) => f.message)).toEqual(["We verified only 2 listings, fewer than the 3 we aim for."]);
  });
});

describe("mismatched beds", () => {
  const ls = [listing(1500), listing(1550), listing(1650, { label: "2BR/1BA on Pine St", beds: 2 })];
  const a = analyze(prep(ls), renter(1500, 1700), TODAY);

  it("names the listing with a different bedroom count", () => {
    expect(a.thinFlags).toEqual([
      {
        code: "beds_mismatch",
        message: "One listing has a different number of bedrooms than your unit: 2BR/1BA on Pine St.",
      },
    ]);
  });

  it("is thin, defaults to general_inquiry and drops match_listings", () => {
    expect(a.isThin).toBe(true);
    expect(a.defaultAsk).toBe("general_inquiry");
    expect(types(a)).not.toContain("match_listings");
  });

  it("names several listings in one sentence", () => {
    const flags = thinEvidence(
      prep([]).unit,
      [listing(1500, { label: "Studio on Pine St", beds: 0 }), listing(1600, { label: "2BR on Locust St", beds: 2 }), listing(1550)],
      TODAY,
    );
    expect(flags.map((f) => f.message)).toEqual([
      "2 listings have a different number of bedrooms than your unit: Studio on Pine St and 2BR on Locust St.",
    ]);
  });
});

describe("stale listing", () => {
  it("counts whole calendar days", () => {
    expect(daysSince("2026-11-09", TODAY)).toBe(0);
    expect(daysSince("2026-10-18", TODAY)).toBe(22);
  });

  it("flags a listing checked more than 21 days ago", () => {
    const ls = [listing(1500), listing(1550), listing(1600, { label: "1BR on Walnut St", checkedDate: "2026-10-18" })];
    const a = analyze(prep(ls), renter(1500, 1700), TODAY);
    expect(a.thinFlags).toEqual([
      {
        code: "stale_listing",
        message: "One listing was checked more than 21 days ago and may have changed: 1BR on Walnut St.",
      },
    ]);
    expect(a.defaultAsk).toBe("general_inquiry");
    expect(types(a)).not.toContain("match_listings");
  });

  it("does not flag a listing checked exactly 21 days ago", () => {
    const ls = [listing(1500), listing(1550), listing(1600, { checkedDate: "2026-10-19" })];
    expect(thinEvidence(prep(ls).unit, ls, TODAY)).toEqual([]);
  });
});

describe("wide spread", () => {
  it("flags (max - min) / median above 25%", () => {
    // (1900 - 1400) / 1600 = 31%
    const ls = [listing(1400), listing(1600), listing(1900)];
    const a = analyze(prep(ls), renter(1500, 1700), TODAY);
    expect(a.thinFlags).toEqual([
      { code: "wide_spread", message: "The listings range from $1,400 to $1,900, which is a wide spread." },
    ]);
    expect(a.defaultAsk).toBe("general_inquiry");
    expect(types(a)).not.toContain("match_listings");
  });

  it("does not flag a spread of exactly 25%", () => {
    // (1800 - 1400) / 1600 = 25%
    const ls = [listing(1400), listing(1600), listing(1800)];
    expect(thinEvidence(prep(ls).unit, ls, TODAY)).toEqual([]);
  });
});

describe("several flags at once", () => {
  it("returns each flag that fires, in a fixed order", () => {
    const ls = [listing(1200, { beds: 2, checkedDate: "2026-09-01" }), listing(1900)];
    expect(thinEvidence(prep(ls).unit, ls, TODAY).map((f) => f.code)).toEqual([
      "few_listings",
      "beds_mismatch",
      "stale_listing",
      "wide_spread",
    ]);
  });
});

/* Ask option details ------------------------------------------------ */

describe("askOptions", () => {
  const solid = { median: 1550, isThin: false };

  it("rounds meet_middle to the nearest $5", () => {
    // 1487 + 113 / 2 = 1543.5 -> 1545
    const { options } = askOptions(renter(1487, 1600), solid);
    expect(options.find((o) => o.type === "meet_middle")?.rent).toBe(1545);
  });

  it("rounds match_listings to the nearest $5", () => {
    const { options } = askOptions(renter(1500, 1700), { median: 1572.5, isThin: false });
    expect(options.find((o) => o.type === "match_listings")?.rent).toBe(1575);
  });

  it("leaves out meet_middle when rounding would land on the offer", () => {
    // 1500 + 5 / 2 = 1502.5 -> 1505, the offer itself
    const { options } = askOptions(renter(1500, 1505), solid);
    expect(options.map((o) => o.type)).not.toContain("meet_middle");
  });

  it("leaves out match_listings when the rounded median equals the offer", () => {
    const { options } = askOptions(renter(1500, 1700), { median: 1698, isThin: false });
    expect(options.map((o) => o.type)).not.toContain("match_listings");
  });

  it("uses the renter's lease length in the savings line", () => {
    const { options } = askOptions(renter(1500, 1600, { leaseMonths: 1 }), solid);
    expect(options[0].savingsLine).toBe("If your landlord agrees, you'd pay $100 less over 1 month than the offer.");
  });

  it("never uses promise or odds language", () => {
    const a = analyze(prep([listing(1500), listing(1550), listing(1600)]), renter(1500, 1700), TODAY);
    const copy = [a.positionSentence, ...a.thinFlags.map((f) => f.message), ...a.options.map((o) => o.savingsLine ?? "")]
      .join(" ")
      .toLowerCase();
    for (const word of ["guarantee", "chance", "likely", "odds", "score", "recommend"]) {
      expect(copy).not.toContain(word);
    }
  });
});

describe("roundTo5", () => {
  it("rounds to the nearest $5", () => {
    expect(roundTo5(1542.4)).toBe(1540);
    expect(roundTo5(1542.5)).toBe(1545);
    expect(roundTo5(1550)).toBe(1550);
  });
});
