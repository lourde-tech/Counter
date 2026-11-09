import type { Tone } from "@/lib/templates";
import Segmented from "./Segmented";

export default function ToneToggle({ tone, onChange }: { tone: Tone; onChange: (tone: Tone) => void }) {
  return (
    <Segmented<Tone>
      label="Tone"
      value={tone}
      onChange={onChange}
      options={[
        { value: "friendly", label: "Friendly" },
        { value: "direct", label: "Direct" },
      ]}
    />
  );
}
