import { describe, expect, it } from "vitest";
import { caseUrl, decodeCase, encodeCase } from "./link";
import { buildFeedbackUrl, feedbackValues, parseEntryIds, type FeedbackPayload } from "./feedback";
import { buildMailto } from "./share";
import { contactHref } from "./env";
import type { CasePrep } from "./types";

const PREP: CasePrep = {
  caseCode: "C01",
  unit: { label: "Fairmount area, 1BR", beds: 1, baths: 1 },
  listings: [
    {
      label: "Café Row",
      beds: 1,
      baths: 1,
      advertisedRent: 1650,
      sourceName: "Zillow",
      url: "https://www.zillow.com/homedetails/1",
      checkedDate: "2026-11-02",
      checkedBy: "JW",
    },
  ],
  teamNote: "Two blocks from you — same building type.",
};

function encodeRaw(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

describe("case links", () => {
  it("round-trips a case, including non-ASCII text", () => {
    expect(decodeCase(encodeCase(PREP))).toEqual(PREP);
    expect(decodeCase(`#${encodeCase(PREP)}`)).toEqual(PREP);
  });

  it("uses only URL-safe characters", () => {
    expect(encodeCase(PREP)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("builds a /c# link", () => {
    expect(caseUrl("https://counter.example/", PREP)).toBe(`https://counter.example/c#${encodeCase(PREP)}`);
  });

  it("rejects empty, garbled, invalid and tampered links", () => {
    expect(decodeCase("")).toBeNull();
    expect(decodeCase("#")).toBeNull();
    expect(decodeCase("not base64!")).toBeNull();
    expect(decodeCase("abc")).toBeNull();
    expect(decodeCase(encodeRaw({ hello: "world" }))).toBeNull();
    const evil = { ...PREP, listings: [{ ...PREP.listings[0], url: "javascript:alert(1)" }] };
    expect(decodeCase(encodeRaw(evil))).toBeNull();
    const tooMany = { ...PREP, listings: Array(4).fill(PREP.listings[0]) };
    expect(decodeCase(encodeRaw(tooMany))).toBeNull();
  });
});

const PAYLOAD: FeedbackPayload = {
  caseCode: "C01",
  decision: "not_sending",
  copied: true,
  emailOpened: false,
  edited: true,
  askType: "keep_current",
  thinEvidence: false,
  stopReasons: ["relationship", "in_person"],
};

const FORM = "https://docs.google.com/forms/d/e/FORM_ID/viewform";

describe("feedback link", () => {
  it("parses entry ids, with or without the entry. prefix, ignoring junk", () => {
    expect(parseEntryIds('{"caseCode":"entry.111","decision":"222","rent":"333","copied":"abc"}')).toEqual({
      caseCode: "entry.111",
      decision: "entry.222",
    });
    expect(parseEntryIds("not json")).toBeNull();
    expect(parseEntryIds("[]")).toBeNull();
    expect(parseEntryIds(undefined)).toBeNull();
  });

  it("prefills only the allowed fields", () => {
    const ids = parseEntryIds(
      '{"caseCode":"1","decision":"2","copied":"3","emailOpened":"4","edited":"5","askType":"6","thinEvidence":"7","stopReasons":"8"}',
    );
    const url = new URL(buildFeedbackUrl(FORM, ids, PAYLOAD)!);
    expect(url.searchParams.get("usp")).toBe("pp_url");
    expect(Object.fromEntries([...url.searchParams].filter(([k]) => k.startsWith("entry.")))).toEqual({
      "entry.1": "C01",
      "entry.2": "Not sending",
      "entry.3": "yes",
      "entry.4": "no",
      "entry.5": "yes",
      "entry.6": "Keep my current rent",
      "entry.7": "no",
      "entry.8": "Worried about my landlord relationship; I'd rather talk in person",
    });
  });

  it("has no field that could carry rents, names, listings or message text", () => {
    expect(Object.keys(feedbackValues(PAYLOAD)).sort()).toEqual(
      ["askType", "caseCode", "copied", "decision", "edited", "emailOpened", "stopReasons", "thinEvidence"].sort(),
    );
  });

  it("falls back to the plain form, and refuses non-https or missing URLs", () => {
    expect(buildFeedbackUrl(FORM, null, PAYLOAD)).toBe(FORM);
    expect(buildFeedbackUrl("http://example.com/form", null, PAYLOAD)).toBeNull();
    expect(buildFeedbackUrl("", null, PAYLOAD)).toBeNull();
  });
});

describe("mailto", () => {
  it("encodes subject and body with \\r\\n line breaks and no recipient", () => {
    const href = buildMailto("About my lease & renewal", "Hi Dana,\n\nLine two?\nThanks");
    expect(href).toBe(
      "mailto:?subject=About%20my%20lease%20%26%20renewal&body=Hi%20Dana%2C%0D%0A%0D%0ALine%20two%3F%0D%0AThanks",
    );
  });
});

describe("team contact", () => {
  it("links emails, phone numbers and https URLs", () => {
    expect(contactHref("team@counter.example")).toBe("mailto:team@counter.example");
    expect(contactHref("(215) 555-0134")).toBe("sms:2155550134");
    expect(contactHref("https://wa.me/12155550134")).toBe("https://wa.me/12155550134");
    expect(contactHref("Ask Jordan")).toBeNull();
  });
});
