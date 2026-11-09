"use client";

import { useId, useState } from "react";
import { FEEDBACK_FORM_URL, FORM_ENTRY_IDS } from "@/lib/env";
import { buildFeedbackUrl } from "@/lib/feedback";
import { DECISION_LABELS, DECISIONS, type Decision, type SessionState, type StopReason } from "@/lib/types";
import StepHeading from "./StepHeading";
import StopReasons from "./StopReasons";
import TeamContact from "./TeamContact";
import { btnPrimary } from "./styles";

interface Props {
  session: SessionState;
  caseCode: string;
  thinEvidence: boolean;
  onDecision: (decision: Decision) => void;
  onStopReasons: (reasons: StopReason[]) => void;
}

export default function DecisionStep({ session, caseCode, thinEvidence, onDecision, onStopReasons }: Props) {
  const name = useId();
  const [sentFeedback, setSentFeedback] = useState(false);
  const { decision } = session;

  const feedbackUrl = buildFeedbackUrl(FEEDBACK_FORM_URL, FORM_ENTRY_IDS, {
    caseCode,
    decision,
    copied: session.copied,
    emailOpened: session.emailOpened,
    edited: session.edited,
    askType: session.ask?.type ?? null,
    thinEvidence,
    stopReasons: decision === "not_sending" ? session.stopReasons : [],
  });

  return (
    <div>
      <StepHeading>What&apos;s your plan?</StepHeading>

      <fieldset>
        <legend className="sr-only">What&apos;s your plan?</legend>
        <div className="space-y-2">
          {DECISIONS.map((d) => {
            const on = decision === d;
            return (
              <label
                key={d}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-5 transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-violet-deep ${
                  on ? "border-violet bg-lavender ring-1 ring-violet" : "border-ink bg-paper hover:bg-lavender"
                }`}
              >
                <input type="radio" name={name} checked={on} onChange={() => onDecision(d)} className="sr-only" />
                <span
                  aria-hidden
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-violet" : "border-ink"}`}
                >
                  {on && <span className="size-2.5 rounded-full bg-violet" />}
                </span>
                <span className="font-display font-medium">{DECISION_LABELS[d]}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {decision === "not_sending" && (
        <div className="mt-8">
          <StopReasons value={session.stopReasons} onChange={onStopReasons} />
        </div>
      )}

      <div className="mt-10">
        {feedbackUrl ? (
          decision ? (
            <a
              href={feedbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSentFeedback(true)}
              className={btnPrimary}
            >
              Let the Counter team know
            </a>
          ) : (
            <button type="button" disabled className={btnPrimary}>
              Let the Counter team know
            </button>
          )
        ) : (
          <p className="rounded-2xl border border-ink bg-paper p-4">
            Let the Counter team know what you decided: message <TeamContact />.
          </p>
        )}
        {feedbackUrl && (
          <p className="mt-3 text-sm text-ink">
            Opens a short form with only your choices on this page. No rents, names, listings or message text. You
            submit it yourself.
          </p>
        )}
        {sentFeedback && (
          <p className="mt-3 font-medium" role="status">
            Thank you. You can close this page whenever you&apos;re ready.
          </p>
        )}
      </div>

      <p className="mt-10 text-lg">
        If your landlord replies, message us at <TeamContact />.
      </p>
    </div>
  );
}
