"use client";

import { useRef, useState } from "react";
import type { Message, Tone } from "@/lib/templates";
import CopyButton from "./CopyButton";
import MessageEditor from "./MessageEditor";
import OpenEmailButton from "./OpenEmailButton";
import StepHeading from "./StepHeading";
import ToneToggle from "./ToneToggle";
import { btnSecondary, btnText } from "./styles";

interface Props {
  message: Message;
  tone: Tone;
  /** True when the renter has edits for this exact ask and tone. */
  hasEdits: boolean;
  /** True when earlier edits were replaced because the ask or offer changed. */
  redrafted: boolean;
  onToneChange: (tone: Tone) => void;
  onEdit: (message: Message) => void;
  onCopied: () => void;
  onEmailOpened: () => void;
  onNotSending: () => void;
  onNext: () => void;
}

export default function MessageStep(props: Props) {
  const { message, tone, hasEdits, redrafted, onToneChange, onEdit, onCopied, onEmailOpened, onNotSending, onNext } = props;
  const [pendingTone, setPendingTone] = useState<Tone | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  function requestTone(next: Tone) {
    if (next === tone) return;
    if (hasEdits) setPendingTone(next);
    else onToneChange(next);
  }

  function selectBody() {
    const el = bodyRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(0, el.value.length);
  }

  return (
    <div>
      <StepHeading>Your message</StepHeading>
      <p className="-mt-3 mb-6 text-ink">
        Edit anything. Counter never sends it. You do, if and when you want to.
      </p>

      <ToneToggle tone={pendingTone ?? tone} onChange={requestTone} />

      {pendingTone && (
        <div className="mt-3 rounded-2xl border border-ink bg-paper p-4" role="alertdialog" aria-label="Replace your edits?">
          <p>Switching tone will replace your edits with a new draft.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="h-11 flex-1 rounded-full bg-violet font-display font-medium text-paper hover:bg-violet-deep transition-colors duration-200"
              onClick={() => {
                onToneChange(pendingTone);
                setPendingTone(null);
              }}
            >
              Switch tone
            </button>
            <button
              type="button"
              className="h-11 flex-1 rounded-full border border-ink bg-paper font-display font-medium text-ink hover:bg-lavender transition-colors duration-200"
              onClick={() => setPendingTone(null)}
            >
              Keep my edits
            </button>
          </div>
        </div>
      )}

      {redrafted && (
        <p className="mt-3 rounded-2xl border border-ink bg-paper p-4 text-sm" role="status">
          You changed your ask, so this is a fresh draft for it. Your earlier edits were replaced.
        </p>
      )}

      <div className="mt-5">
        <MessageEditor subject={message.subject} body={message.body} onChange={onEdit} bodyRef={bodyRef} />
      </div>

      <div className="mt-8 space-y-3">
        <CopyButton text={message.body} onCopied={onCopied} onFailed={selectBody} />
        <OpenEmailButton subject={message.subject} body={message.body} onOpened={onEmailOpened} />
        <button type="button" onClick={onNotSending} className={btnSecondary}>
          I&apos;m not sending this
        </button>
        <div className="pt-2 text-center">
          <button type="button" onClick={onNext} className={btnText}>
            Done? Tell us your plan <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
