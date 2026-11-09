/** mailto with no recipient: the renter picks who to send it to. Line breaks become \r\n. */
export function buildMailto(subject: string, body: string): string {
  const crlf = body.replace(/\r\n|\r|\n/g, "\r\n");
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(crlf)}`;
}

/**
 * Copies text. Tries the async Clipboard API first, then a hidden-textarea
 * fallback that also works in older iOS Safari. Call it straight from a tap
 * handler: iOS only allows copying inside the user gesture.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path.
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const ta = document.createElement("textarea");
  ta.value = text;
  // 16px stops iOS from zooming; fixed + transparent keeps the page from jumping.
  ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;border:0;padding:0;";
  ta.setAttribute("aria-hidden", "true");
  document.body.appendChild(ta);

  const selection = document.getSelection();
  const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  // iOS Safari needs a contentEditable, non-readonly element and an explicit range.
  ta.contentEditable = "true";
  ta.readOnly = false;
  const range = document.createRange();
  range.selectNodeContents(ta);
  selection?.removeAllRanges();
  selection?.addRange(range);
  ta.setSelectionRange(0, text.length);

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  document.body.removeChild(ta);
  selection?.removeAllRanges();
  if (previous) selection?.addRange(previous);
  return ok;
}
