import StepHeading from "./StepHeading";
import { btnPrimary } from "./styles";

const PROMISES = [
  "You see the evidence first",
  "You choose the ask and the words",
  "You decide whether to send it",
];

export default function WelcomeStep({ caseCode, onStart }: { caseCode: string; onStart: () => void }) {
  return (
    <div>
      <StepHeading kicker="Your rent renewal">Let&apos;s look at your offer together.</StepHeading>
      <p className="text-lg leading-relaxed">
        Our team looked up listings near you by hand. You&apos;ll see them, choose what to ask for, and get a message you
        can edit and send yourself. Nothing you enter is saved after you close this page.
      </p>

      <ol className="mt-8 space-y-3">
        {PROMISES.map((p, i) => (
          <li key={p} className="flex items-center gap-4 rounded-2xl border border-ink bg-paper p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ink bg-paper font-display font-semibold tabular-nums">
              {i + 1}
            </span>
            <span className="font-medium">{p}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <button type="button" onClick={onStart} className={btnPrimary}>
          Start
        </button>
        <p className="mt-3 text-center text-sm text-ink">Case {caseCode}</p>
      </div>
    </div>
  );
}
