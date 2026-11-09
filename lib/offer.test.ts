import { describe, expect, it } from "vitest";
import { EMPTY_OFFER, parseMoney, validateOffer } from "./offer";

describe("parseMoney", () => {
  it("accepts dollar signs, commas and cents", () => {
    expect(parseMoney("$1,650")).toBe(1650);
    expect(parseMoney(" 1650.5 ")).toBe(1650.5);
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("about 1600")).toBeNaN();
    expect(parseMoney("1.234")).toBeNaN();
  });
});

describe("validateOffer", () => {
  it("asks for both rents", () => {
    const { renter, errors } = validateOffer(EMPTY_OFFER);
    expect(renter).toBeNull();
    expect(errors.currentRent).toBe("Enter what you pay now.");
    expect(errors.proposedRent).toBe("Enter the new rent from your renewal offer.");
  });

  it("builds a RenterInput with only what was given", () => {
    const { renter } = validateOffer({ ...EMPTY_OFFER, currentRent: "1,500", proposedRent: "$1,650" });
    expect(renter).toEqual({ currentRent: 1500, proposedRent: 1650, leaseMonths: 12, landlordKind: "unsure" });
  });

  it("combines years and months of tenure and maps on-time payment", () => {
    const { renter } = validateOffer({
      ...EMPTY_OFFER,
      currentRent: "1500",
      proposedRent: "1650",
      tenureYears: "2",
      tenureMonths: "6",
      paidOnTime: "no",
      landlordName: "  Dana ",
      landlordKind: "person",
    });
    expect(renter).toMatchObject({ tenureMonths: 30, paidOnTime: false, landlordName: "Dana", landlordKind: "person" });
  });

  it("rejects bad lease lengths and tenure", () => {
    const { errors } = validateOffer({ ...EMPTY_OFFER, currentRent: "1500", proposedRent: "1650", leaseMonths: "0", tenureMonths: "14" });
    expect(errors.leaseMonths).toBeDefined();
    expect(errors.tenureMonths).toBeDefined();
  });
});
