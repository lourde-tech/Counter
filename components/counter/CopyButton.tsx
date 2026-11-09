"use client";

import { useState } from "react";
import { copyText } from "@/lib/share";
import { btnPrimary } from "./styles";

interface Props {
  text: string;
  onCopied: () => void;
  /** Called when both copy methods fail, so the caller can select the text for a manual copy. */
  onFailed: () => void;
}

export default function CopyButton({ text, onCopied, onFailed }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleClick() {
    // Called straight from the tap so iOS treats it as a user gesture.
    const ok = await copyText(text);
    setStatus(ok ? "copied" : "failed");
    if (ok) onCopied();
    else onFailed();
  }

  return (
    <div>
      <button type="button" onClick={handleClick} className={btnPrimary}>
        {status === "copied" ? "Copied" : "Copy message"}
      </button>
      <p aria-live="polite" className="mt-2 min-h-5 text-center text-sm text-slate">
        {status === "copied" && "Copied. Paste it into a text or an email to your landlord."}
        {status === "failed" && "Couldn't copy automatically. The message is selected: press and hold it to copy."}
      </p>
    </div>
  );
}
