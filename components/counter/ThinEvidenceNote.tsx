import type { ThinFlag } from "@/lib/compare";

export default function ThinEvidenceNote({ flags }: { flags: ThinFlag[] }) {
  if (flags.length === 0) return null;
  return (
    <section className="rounded-2xl border border-ember/25 bg-ember-soft p-5" aria-label="Limited evidence">
      <p className="font-medium">The evidence is limited</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/90">
        {flags.map((f) => (
          <li key={f.code}>{f.message}</li>
        ))}
      </ul>
      <p className="mt-3">With limited evidence, a general renewal inquiry may be the stronger first message.</p>
    </section>
  );
}
