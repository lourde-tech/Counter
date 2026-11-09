import { describe, expect, it } from "vitest";
import { analyze } from "./compare";
import { decodeCase, encodeCase } from "./link";
import { SAMPLE_CURRENT_RENT, SAMPLE_PROPOSED_RENT, sampleCase } from "./sample";
import { CasePrepSchema, RenterInputSchema } from "./types";

describe("sample case", () => {
  const today = new Date(2026, 10, 9);
  const prep = sampleCase(today);
  const renter = RenterInputSchema.parse({ currentRent: SAMPLE_CURRENT_RENT, proposedRent: SAMPLE_PROPOSED_RENT });

  it("is a valid case that survives the link round trip", () => {
    expect(CasePrepSchema.safeParse(prep).success).toBe(true);
    expect(decodeCase(encodeCase(prep))).toEqual(prep);
  });

  it("says it is a sample", () => {
    expect(prep.teamNote).toMatch(/sample case/i);
    expect(prep.teamNote).toMatch(/made up/i);
  });

  it("has solid evidence and suggests keeping the current rent", () => {
    const a = analyze(prep, renter, today);
    expect(a.isThin).toBe(false);
    expect(a.range?.median).toBe(SAMPLE_CURRENT_RENT);
    expect(a.suggestedAsk).toBe("keep_current");
  });

  it("stays fresh whatever day it is opened", () => {
    const later = new Date(2027, 5, 1);
    expect(analyze(sampleCase(later), renter, later).isThin).toBe(false);
  });
});
