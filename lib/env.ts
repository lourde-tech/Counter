import { parseEntryIds } from "./feedback";

/*
 * NEXT_PUBLIC_ values are inlined at build time, so they must be referenced
 * literally (process.env.NEXT_PUBLIC_X) and set before `next build`.
 */

export const TEAM_CONTACT = (process.env.NEXT_PUBLIC_TEAM_CONTACT ?? "").trim();
export const FEEDBACK_FORM_URL = (process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL ?? "").trim();
export const FORM_ENTRY_IDS = parseEntryIds(process.env.NEXT_PUBLIC_FORM_ENTRY_IDS);

/** A tappable link for the team contact: email -> mailto, phone -> sms, https -> itself. */
export function contactHref(contact: string): string | null {
  const c = contact.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)) return `mailto:${c}`;
  const digits = c.replace(/[^\d+]/g, "");
  if (/^\+?\d{10,15}$/.test(digits) && /^[\d\s()+.-]+$/.test(c)) return `sms:${digits}`;
  if (/^https:\/\//.test(c)) return c;
  return null;
}
