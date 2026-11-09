import { CasePrepSchema, type CasePrep } from "./types";

/*
 * The case travels in the URL hash: /c#<base64url JSON>.
 * Browsers never send the hash to a server, so the listings stay between our
 * team and the renter. Decoding always re-validates with zod, because anyone
 * can edit a link.
 */

const MAX_PAYLOAD_CHARS = 8000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export function encodeCase(prep: CasePrep): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(prep)));
}

/** Returns null for anything that isn't a valid case. Accepts a leading "#". */
export function decodeCase(hash: string | null | undefined): CasePrep | null {
  const payload = (hash ?? "").replace(/^#/, "").trim();
  if (!payload || payload.length > MAX_PAYLOAD_CHARS || !/^[A-Za-z0-9_-]+$/.test(payload)) return null;
  try {
    const json = new TextDecoder("utf-8", { fatal: true }).decode(fromBase64Url(payload));
    const parsed = CasePrepSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function caseUrl(origin: string, prep: CasePrep): string {
  return `${origin.replace(/\/$/, "")}/c#${encodeCase(prep)}`;
}
