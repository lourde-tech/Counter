import { STOP_REASON_LABELS, STOP_REASONS, type StopReason } from "@/lib/types";

export default function StopReasons({ value, onChange }: { value: StopReason[]; onChange: (next: StopReason[]) => void }) {
  function toggle(reason: StopReason) {
    onChange(value.includes(reason) ? value.filter((r) => r !== reason) : [...value, reason]);
  }

  return (
    <fieldset>
      <legend className="font-medium">What&apos;s holding you back? Pick any that fit.</legend>
      <div className="mt-3 space-y-2">
        {STOP_REASONS.map((reason) => {
          const on = value.includes(reason);
          return (
            <label
              key={reason}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-ember ${
                on ? "border-ink bg-white" : "border-line bg-white/60 hover:bg-white"
              }`}
            >
              <input type="checkbox" checked={on} onChange={() => toggle(reason)} className="sr-only" />
              <span
                aria-hidden
                className={`flex size-5 shrink-0 items-center justify-center rounded-md border-2 text-xs ${
                  on ? "border-ink bg-ink text-paper" : "border-line"
                }`}
              >
                {on && "✓"}
              </span>
              {STOP_REASON_LABELS[reason]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
