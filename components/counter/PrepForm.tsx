"use client";

import QRCode from "qrcode";
import { useState } from "react";
import { thinEvidence, type ThinFlag } from "@/lib/compare";
import { caseUrl } from "@/lib/link";
import { copyText } from "@/lib/share";
import { CasePrepSchema, MAX_LISTINGS, type CasePrep } from "@/lib/types";
import Field from "./Field";
import ListingFields, { type ListingDraft } from "./ListingFields";
import StepHeading from "./StepHeading";
import { btnPrimary, btnSecondary, card, errorText, input, label } from "./styles";

interface PrepDraft {
  caseCode: string;
  unitLabel: string;
  beds: string;
  baths: string;
  listings: ListingDraft[];
  teamNote: string;
}

type Errors = Record<string, string>;

interface Output {
  url: string;
  qr: string;
  flags: ThinFlag[];
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyListing(): ListingDraft {
  return { label: "", beds: "", baths: "1", advertisedRent: "", sourceName: "", url: "", checkedDate: todayIso(), checkedBy: "" };
}

function toDraft(prep: CasePrep | null): PrepDraft {
  if (!prep) return { caseCode: "", unitLabel: "", beds: "", baths: "1", listings: [emptyListing()], teamNote: "" };
  return {
    caseCode: prep.caseCode,
    unitLabel: prep.unit.label,
    beds: String(prep.unit.beds),
    baths: String(prep.unit.baths),
    listings: prep.listings.map((l) => ({
      label: l.label,
      beds: String(l.beds),
      baths: String(l.baths),
      advertisedRent: String(l.advertisedRent),
      sourceName: l.sourceName,
      url: l.url,
      checkedDate: l.checkedDate,
      checkedBy: l.checkedBy,
    })),
    teamNote: prep.teamNote ?? "",
  };
}

/** "" -> undefined so zod reports "Enter a number"; "$1,650" -> 1650. */
function num(text: string): number | undefined {
  const t = text.replace(/[$,\s]/g, "");
  return t === "" ? undefined : Number(t);
}

function toCandidate(d: PrepDraft) {
  return {
    caseCode: d.caseCode,
    unit: { label: d.unitLabel, beds: num(d.beds), baths: num(d.baths) },
    listings: d.listings.map((l) => ({
      label: l.label,
      beds: num(l.beds),
      baths: num(l.baths),
      advertisedRent: num(l.advertisedRent),
      sourceName: l.sourceName,
      url: l.url.trim(),
      checkedDate: l.checkedDate,
      checkedBy: l.checkedBy,
    })),
    teamNote: d.teamNote.trim() || undefined,
  };
}

export default function PrepForm({ initial }: { initial: CasePrep | null }) {
  const [draft, setDraft] = useState<PrepDraft>(() => toDraft(initial));
  const [errors, setErrors] = useState<Errors>({});
  const [output, setOutput] = useState<Output | null>(null);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");

  const set = (key: Exclude<keyof PrepDraft, "listings">) => (v: string) => {
    setDraft((d) => ({ ...d, [key]: v }));
    setOutput(null);
  };

  function setListing(i: number, next: ListingDraft) {
    setDraft((d) => ({ ...d, listings: d.listings.map((l, j) => (j === i ? next : l)) }));
    setOutput(null);
  }

  function removeListing(i: number) {
    setDraft((d) => ({ ...d, listings: d.listings.filter((_, j) => j !== i) }));
    setErrors({});
    setOutput(null);
  }

  function addListing() {
    setDraft((d) => ({ ...d, listings: [...d.listings, emptyListing()] }));
    setOutput(null);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCopied("idle");
    const parsed = CasePrepSchema.safeParse(toCandidate(draft));
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setOutput(null);
      return;
    }
    setErrors({});
    const prep = parsed.data;
    const url = caseUrl(window.location.origin, prep);
    const qr = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "L",
      margin: 2,
      width: 640,
      color: { dark: "#121722", light: "#ffffff" },
    });
    setOutput({ url, qr, flags: thinEvidence(prep.unit, prep.listings, new Date()) });
  }

  async function copyLink() {
    if (!output) return;
    setCopied((await copyText(output.url)) ? "copied" : "failed");
  }

  const listingErrors = (i: number) => {
    const prefix = `listings.${i}.`;
    return Object.fromEntries(
      Object.entries(errors)
        .filter(([k]) => k.startsWith(prefix))
        .map(([k, v]) => [k.slice(prefix.length), v]),
    ) as Partial<Record<keyof ListingDraft, string>>;
  };

  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={create} noValidate className="pt-8">
      <StepHeading kicker="Team only">Prep a case</StepHeading>
      <p className="-mt-3 mb-8 text-ink">
        Enter only listings you checked by hand. The link carries everything in its <code>#</code> part, which never
        reaches a server.
      </p>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">The renter&apos;s unit</h2>
        <Field
          label="Case code"
          hint="e.g. C01"
          value={draft.caseCode}
          onValueChange={set("caseCode")}
          error={errors.caseCode}
          autoComplete="off"
          className="max-w-48"
        />
        <Field
          label="Unit label"
          hint="Street area plus unit type, e.g. “Spruce St area, 1BR”. No exact address."
          value={draft.unitLabel}
          onValueChange={set("unitLabel")}
          error={errors["unit.label"]}
          autoComplete="off"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Beds" hint="0 for a studio" inputMode="numeric" value={draft.beds} onValueChange={set("beds")} error={errors["unit.beds"]} />
          <Field label="Baths" inputMode="decimal" value={draft.baths} onValueChange={set("baths")} error={errors["unit.baths"]} />
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="font-display text-lg font-semibold">Verified listings ({draft.listings.length} of {MAX_LISTINGS})</h2>
        {draft.listings.length === 0 && (
          <p className="text-ink">No listings. The renter will see the limited-evidence path and a general inquiry.</p>
        )}
        {draft.listings.map((l, i) => (
          <ListingFields
            key={i}
            index={i}
            value={l}
            onChange={(next) => setListing(i, next)}
            onRemove={() => removeListing(i)}
            errors={listingErrors(i)}
          />
        ))}
        {draft.listings.length < MAX_LISTINGS && (
          <button type="button" onClick={addListing} className={btnSecondary}>
            Add a listing
          </button>
        )}
      </section>

      <section className="mt-10">
        <label htmlFor="team-note" className={label}>
          Note to the renter (optional)
        </label>
        <p className="mt-1 text-sm text-ink">Shown on the evidence screen. Don&apos;t include anything private.</p>
        <textarea
          id="team-note"
          value={draft.teamNote}
          onChange={(e) => set("teamNote")(e.target.value)}
          rows={3}
          maxLength={400}
          className={`${input} mt-1.5 h-auto py-2`}
        />
        {errors.teamNote && <p className={errorText}>{errors.teamNote}</p>}
      </section>

      <button type="submit" className={`${btnPrimary} mt-10`}>
        Create link
      </button>
      {errorCount > 0 && (
        <p className="mt-2 text-center text-sm text-violet-deep" role="alert">
          Fix {errorCount === 1 ? "the field" : `the ${errorCount} fields`} marked above.
        </p>
      )}

      {output && (
        <section className={`${card} mt-8 space-y-4`} aria-live="polite">
          <h2 className="font-display text-lg font-semibold">Link for case {draft.caseCode.trim()}</h2>
          <p className="break-all rounded-xl border border-ink bg-paper p-3 font-mono text-xs leading-relaxed">{output.url}</p>
          <button type="button" onClick={copyLink} className={btnPrimary}>
            {copied === "copied" ? "Copied" : "Copy link"}
          </button>
          {copied === "failed" && <p className="text-sm text-violet-deep">Couldn&apos;t copy. Press and hold the link above.</p>}
          <a href={output.url} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
            Open it as the renter
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL, nothing to optimize */}
          <img src={output.qr} alt="QR code for the renter link" className="mx-auto w-full max-w-72 rounded-xl border border-ink" />
          <p className="text-center text-sm text-ink">If the QR code is hard to scan, send the link instead.</p>
          {output.flags.length > 0 ? (
            <div className="rounded-xl border border-violet-deep bg-lavender p-4 text-sm">
              <p className="font-medium">The renter will see the limited-evidence path:</p>
              <ul className="mt-1 list-disc pl-5">
                {output.flags.map((f) => (
                  <li key={f.code}>{f.message}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-ink">The evidence isn&apos;t thin, so the renter won&apos;t see the limited-evidence note.</p>
          )}
        </section>
      )}
    </form>
  );
}
