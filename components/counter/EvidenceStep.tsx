import type { Analysis } from "@/lib/compare";
import type { CasePrep } from "@/lib/types";
import IncreaseCard from "./IncreaseCard";
import ListingCards from "./ListingCards";
import OfferVsListings from "./OfferVsListings";
import PositionLine from "./PositionLine";
import StepHeading from "./StepHeading";
import ThinEvidenceNote from "./ThinEvidenceNote";
import { btnPrimary, card } from "./styles";

interface Props {
  prep: CasePrep;
  analysis: Analysis;
  today: Date;
  onContinue: () => void;
}

export default function EvidenceStep({ prep, analysis, today, onContinue }: Props) {
  const { increase } = analysis;
  return (
    <div>
      <StepHeading>The evidence</StepHeading>

      <div className="space-y-4">
        <IncreaseCard increase={increase} />
        <OfferVsListings
          current={increase.current}
          proposed={increase.proposed}
          listings={prep.listings}
          range={analysis.range}
        />
        <PositionLine sentence={analysis.positionSentence} />
        <ThinEvidenceNote flags={analysis.thinFlags} />
      </div>

      <h2 className="mt-10 font-display text-lg font-semibold">Listings near you</h2>
      <p className="mt-1 mb-4 text-slate">
        Our team checked each of these by hand. The rents are exactly as advertised.
      </p>
      <ListingCards comparisons={analysis.listings} unit={prep.unit} today={today} />

      {prep.teamNote && (
        <div className={`${card} mt-4`}>
          <p className="text-sm font-medium text-slate">A note from our team</p>
          <p className="mt-1 whitespace-pre-line">{prep.teamNote}</p>
        </div>
      )}

      <button type="button" onClick={onContinue} className={`${btnPrimary} mt-10`}>
        Choose what to ask for
      </button>
    </div>
  );
}
