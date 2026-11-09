import { z } from "zod";
import {
  ASK_LABELS,
  DECISION_LABELS,
  STOP_REASON_LABELS,
  type AskType,
  type Decision,
  type StopReason,
} from "./types";

/*
 * The only data that leaves the page, and only when the renter taps
 * "Let the Counter team know": a Google Form opens with these fields filled in,
 * and the renter submits it themselves. Never rents, names, listing details or
 * message text.
 */

export const FEEDBACK_FIELDS = [
  "caseCode",
  "decision",
  "copied",
  "emailOpened",
  "edited",
  "askType",
  "thinEvidence",
  "stopReasons",
] as const;
export type FeedbackField = (typeof FEEDBACK_FIELDS)[number];

export type EntryIds = Partial<Record<FeedbackField, string>>;

export interface FeedbackPayload {
  caseCode: string;
  decision: Decision | null;
  copied: boolean;
  emailOpened: boolean;
  edited: boolean;
  askType: AskType | null;
  thinEvidence: boolean;
  stopReasons: StopReason[];
}

const EntryIdValue = z
  .string()
  .trim()
  .regex(/^(entry\.)?\d+$/)
  .transform((v) => (v.startsWith("entry.") ? v : `entry.${v}`));

/**
 * Parses NEXT_PUBLIC_FORM_ENTRY_IDS, e.g. {"caseCode":"entry.123","decision":"456"}.
 * Unknown keys and malformed ids are ignored. Returns null if the JSON is unusable.
 */
export function parseEntryIds(raw: string | undefined): EntryIds | null {
  if (!raw?.trim()) return null;
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof json !== "object" || json === null || Array.isArray(json)) return null;

  const ids: EntryIds = {};
  for (const field of FEEDBACK_FIELDS) {
    const parsed = EntryIdValue.safeParse((json as Record<string, unknown>)[field]);
    if (parsed.success) ids[field] = parsed.data;
  }
  return Object.keys(ids).length > 0 ? ids : null;
}

const yesNo = (b: boolean) => (b ? "yes" : "no");

/** The exact text sent for each field. Labels match what the renter saw. */
export function feedbackValues(p: FeedbackPayload): Record<FeedbackField, string> {
  return {
    caseCode: p.caseCode,
    decision: p.decision ? DECISION_LABELS[p.decision] : "",
    copied: yesNo(p.copied),
    emailOpened: yesNo(p.emailOpened),
    edited: yesNo(p.edited),
    askType: p.askType ? ASK_LABELS[p.askType] : "",
    thinEvidence: yesNo(p.thinEvidence),
    stopReasons: p.stopReasons.map((r) => STOP_REASON_LABELS[r]).join("; "),
  };
}

/** A prefilled Google Form link, or null when the form URL isn't configured or isn't https. */
export function buildFeedbackUrl(formUrl: string, entryIds: EntryIds | null, payload: FeedbackPayload): string | null {
  let url: URL;
  try {
    url = new URL(formUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (!entryIds) return url.toString();

  url.searchParams.set("usp", "pp_url");
  const values = feedbackValues(payload);
  for (const field of FEEDBACK_FIELDS) {
    const id = entryIds[field];
    if (id && values[field] !== "") url.searchParams.set(id, values[field]);
  }
  return url.toString();
}
