import type { Analysis } from "@/lib/compare";
import type { ChosenAsk, RenterInput } from "@/lib/types";
import AskOptionCards from "./AskOptionCards";
import StepHeading from "./StepHeading";
import { btnPrimary } from "./styles";

interface Props {
  analysis: Analysis;
  renter: RenterInput;
  selected: ChosenAsk | null;
  onSelect: (ask: ChosenAsk) => void;
  onContinue: () => void;
}

export default function AskStep({ analysis, renter, selected, onSelect, onContinue }: Props) {
  const needsPerk = selected?.type === "perk_instead" && !selected.perk;
  const ready = selected !== null && !needsPerk;

  let note: string | null = null;
  if (analysis.defaultAsk === "general_inquiry" && analysis.isThin) {
    note = "Because the evidence is limited, a general renewal inquiry is selected to start. You can pick any option.";
  } else if (analysis.defaultAsk === "general_inquiry") {
    note = "Since your rent isn't going up, a general inquiry is selected to start. You can pick any option.";
  }

  return (
    <div>
      <StepHeading>What do you want to ask for?</StepHeading>
      <p className="-mt-3 mb-6 text-ink">Pick one. You&apos;ll see and edit the message next.</p>

      {note && <p className="mb-4 rounded-2xl border border-ink bg-paper p-4 text-sm">{note}</p>}

      <AskOptionCards
        options={analysis.options}
        selected={selected}
        onSelect={onSelect}
        renter={renter}
        suggestedAsk={analysis.suggestedAsk}
        suggestionReason={analysis.suggestionReason}
      />

      <button type="button" onClick={onContinue} disabled={!ready} className={`${btnPrimary} mt-8`}>
        Write my message
      </button>
      {needsPerk && <p className="mt-2 text-center text-sm text-ink">Pick a perk to continue.</p>}
    </div>
  );
}
