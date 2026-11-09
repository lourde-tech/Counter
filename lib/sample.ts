import type { CasePrep } from "./types";

/*
 * A clearly labeled sample case for demos, linked from the landing page.
 * The listings are made up and the case says so on the evidence screen.
 * Dates are set relative to today so the sample never turns stale.
 *
 * With $1,950 now and $2,100 new, the listings' median equals the current
 * rent, so the app suggests "Keep my current rent".
 */

export const SAMPLE_CURRENT_RENT = 1950;
export const SAMPLE_PROPOSED_RENT = 2100;

function isoDaysAgo(today: Date, days: number): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function sampleCase(today: Date = new Date()): CasePrep {
  const checkedDate = isoDaysAgo(today, 2);
  const listing = (label: string, advertisedRent: number, sourceName: string, url: string) => ({
    label,
    beds: 1,
    baths: 1,
    advertisedRent,
    sourceName,
    url,
    checkedDate,
    checkedBy: "CT",
  });
  return {
    caseCode: "SAMPLE",
    unit: { label: "Rittenhouse area, 1BR", beds: 1, baths: 1 },
    listings: [
      listing("Spruce St", 1895, "Zillow", "https://www.zillow.com/philadelphia-pa/rentals/"),
      listing("S 22nd St", 1950, "Apartments.com", "https://www.apartments.com/philadelphia-pa/"),
      listing("Pine St", 1990, "Zillow", "https://www.zillow.com/philadelphia-pa/rentals/"),
    ],
    teamNote: "This is a sample case. The listings are made up so you can try Counter.",
  };
}
