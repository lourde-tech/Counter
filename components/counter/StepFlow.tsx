"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { analyze } from "@/lib/compare";
import { decodeCase } from "@/lib/link";
import { EMPTY_OFFER, type OfferDraft } from "@/lib/offer";
import { buildMessage, type Message, type Tone } from "@/lib/templates";
import { INITIAL_SESSION, type CasePrep, type ChosenAsk, type SessionState } from "@/lib/types";
import AskStep from "./AskStep";
import DecisionStep from "./DecisionStep";
import EvidenceStep from "./EvidenceStep";
import MessageStep from "./MessageStep";
import OfferStep from "./OfferStep";
import ProgressBar from "./ProgressBar";
import StepHeading from "./StepHeading";
import TeamContact from "./TeamContact";
import WelcomeStep from "./WelcomeStep";
import { useHash } from "./useHash";

const STEPS = ["Welcome", "Your offer", "The evidence", "Your ask", "Your message", "Decision"] as const;
const EASE = [0.22, 1, 0.36, 1] as const;

/** Reads the case from the URL hash. Nothing here is sent anywhere. */
export default function StepFlow() {
  const hash = useHash();
  const prep = useMemo(() => (hash === null ? undefined : decodeCase(hash)), [hash]);

  if (prep === undefined) {
    return <p className="pt-16 text-center text-ink">Loading…</p>;
  }

  if (prep === null) {
    return (
      <div className="pt-12">
        <StepHeading>This link isn&apos;t working.</StepHeading>
        <p className="text-lg leading-relaxed">
          This link isn&apos;t working. Message us at <TeamContact /> for a new one.
        </p>
      </div>
    );
  }

  // A new link means a new case: start fresh.
  return <Flow key={hash} prep={prep} />;
}

function Flow({ prep }: { prep: CasePrep }) {
  const reduce = useReducedMotion();
  const [today] = useState(() => new Date());
  const [step, setStep] = useState(0);
  const [session, setSession] = useState<SessionState>(INITIAL_SESSION);
  const [offer, setOffer] = useState<OfferDraft>(EMPTY_OFFER);
  const [tone, setTone] = useState<Tone>("friendly");
  /** The renter's edited draft, tagged with the ask/tone/offer it was written for. */
  const [edits, setEdits] = useState<(Message & { key: string }) | null>(null);

  const renter = session.renter;
  const analysis = useMemo(() => (renter ? analyze(prep, renter, today) : null), [prep, renter, today]);

  // The renter's pick if it's still offered, otherwise the default (which may be none).
  const ask: ChosenAsk | null = useMemo(() => {
    if (!analysis) return null;
    if (session.ask && analysis.options.some((o) => o.type === session.ask!.type)) return session.ask;
    return analysis.defaultAsk ? { type: analysis.defaultAsk } : null;
  }, [analysis, session.ask]);

  const draftKey = JSON.stringify([ask, tone, renter]);
  const generated = useMemo(() => {
    if (!analysis || !renter || !ask) return null;
    return buildMessage({
      ask,
      askRent: analysis.options.find((o) => o.type === ask.type)?.rent ?? null,
      tone,
      renter,
      unit: prep.unit,
      listings: prep.listings,
    });
  }, [analysis, renter, ask, tone, prep]);
  const hasEdits = edits !== null && edits.key === draftKey;
  const message = hasEdits ? edits : generated;

  const update = (patch: Partial<SessionState>) => setSession((s) => ({ ...s, ...patch }));

  function go(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  function renderStep() {
    switch (step) {
      case 0:
        return <WelcomeStep caseCode={prep.caseCode} onStart={() => go(1)} />;
      case 1:
        return (
          <OfferStep
            draft={offer}
            onDraftChange={setOffer}
            onContinue={(r) => {
              update({ renter: r });
              go(2);
            }}
          />
        );
      case 2:
        return analysis && <EvidenceStep prep={prep} analysis={analysis} today={today} onContinue={() => go(3)} />;
      case 3:
        return (
          analysis &&
          renter && (
            <AskStep
              analysis={analysis}
              renter={renter}
              selected={ask}
              onSelect={(a) => update({ ask: a })}
              onContinue={() => {
                update({ ask });
                go(4);
              }}
            />
          )
        );
      case 4:
        return (
          message && (
            <MessageStep
              message={message}
              tone={tone}
              hasEdits={hasEdits}
              redrafted={edits !== null && !hasEdits}
              onToneChange={(t) => {
                setEdits(null);
                setTone(t);
              }}
              onEdit={(m) => {
                setEdits({ ...m, key: draftKey });
                update({ edited: true });
              }}
              onCopied={() => update({ copied: true })}
              onEmailOpened={() => update({ emailOpened: true })}
              onNotSending={() => {
                update({ decision: "not_sending" });
                go(5);
              }}
              onNext={() => go(5)}
            />
          )
        );
      case 5:
        return (
          analysis && (
            <DecisionStep
              session={session}
              caseCode={prep.caseCode}
              thinEvidence={analysis.isThin}
              onDecision={(d) => update({ decision: d })}
              onStopReasons={(r) => update({ stopReasons: r })}
            />
          )
        );
    }
  }

  return (
    <div>
      <ProgressBar
        step={step}
        total={STEPS.length}
        title={STEPS[step]}
        onBack={step > 0 ? () => go(step - 1) : undefined}
      />
      <div className="pt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
