import { describe, expect, it } from "vitest";
import { CasePrepSchema, RenterInputSchema } from "./types";
import { bedBathShort, formatDate, formatMoney, formatPct, joinLabels } from "./format";

const validListing = {
  label: "2BR/1BA on Spruce St",
  beds: 2,
  baths: 1,
  advertisedRent: 1650,
  sourceName: "Zillow",
  url: "https://www.zillow.com/homedetails/example",
  checkedDate: "2026-11-02",
  checkedBy: "JW",
};

const validPrep = {
  caseCode: "C01",
  unit: { label: "Spruce St area, 2BR", beds: 2, baths: 1 },
  listings: [validListing],
};

describe("CasePrepSchema", () => {
  it("accepts 0 to 3 listings", () => {
    expect(CasePrepSchema.safeParse({ ...validPrep, listings: [] }).success).toBe(true);
    expect(CasePrepSchema.safeParse({ ...validPrep, listings: [validListing, validListing, validListing] }).success).toBe(true);
  });

  it("rejects more than 3 listings", () => {
    const listings = [validListing, validListing, validListing, validListing];
    expect(CasePrepSchema.safeParse({ ...validPrep, listings }).success).toBe(false);
  });

  it("rejects non-http listing links", () => {
    for (const url of ["javascript:alert(1)", "data:text/html,hi", "zillow.com/x"]) {
      const listings = [{ ...validListing, url }];
      expect(CasePrepSchema.safeParse({ ...validPrep, listings }).success).toBe(false);
    }
  });

  it("rejects bad dates, half bedrooms and missing rents", () => {
    const bad = [
      { ...validListing, checkedDate: "11/02/2026" },
      { ...validListing, beds: 1.5 },
      { ...validListing, advertisedRent: 0 },
    ];
    for (const l of bad) {
      expect(CasePrepSchema.safeParse({ ...validPrep, listings: [l] }).success).toBe(false);
    }
  });

  it("trims text and keeps the optional team note", () => {
    const parsed = CasePrepSchema.parse({ ...validPrep, caseCode: " C01 ", teamNote: " Two blocks away. " });
    expect(parsed.caseCode).toBe("C01");
    expect(parsed.teamNote).toBe("Two blocks away.");
  });
});

describe("RenterInputSchema", () => {
  it("defaults to a 12-month lease and an unsure landlord kind", () => {
    const r = RenterInputSchema.parse({ currentRent: 1500, proposedRent: 1650 });
    expect(r.leaseMonths).toBe(12);
    expect(r.landlordKind).toBe("unsure");
    expect(r.tenureMonths).toBeUndefined();
    expect(r.paidOnTime).toBeUndefined();
  });

  it("rejects zero or negative rent", () => {
    expect(RenterInputSchema.safeParse({ currentRent: 0, proposedRent: 1650 }).success).toBe(false);
    expect(RenterInputSchema.safeParse({ currentRent: 1500, proposedRent: -1 }).success).toBe(false);
  });
});

describe("format helpers", () => {
  it("formats money with cents only when needed", () => {
    expect(formatMoney(1650)).toBe("$1,650");
    expect(formatMoney(1487.5)).toBe("$1,487.50");
    expect(formatMoney(-50)).toBe("$50");
  });

  it("formats percents to one decimal at most", () => {
    expect(formatPct(0.1)).toBe("10%");
    expect(formatPct(150 / 1550)).toBe("9.7%");
  });

  it("formats labels, beds/baths and dates", () => {
    expect(joinLabels(["A", "B", "C"])).toBe("A, B and C");
    expect(bedBathShort(0, 1)).toBe("Studio/1BA");
    expect(bedBathShort(2, 1.5)).toBe("2BR/1.5BA");
    expect(formatDate("2026-11-02")).toBe("Nov 2, 2026");
  });
});
