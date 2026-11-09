import Field from "./Field";
import { btnText } from "./styles";

export interface ListingDraft {
  label: string;
  beds: string;
  baths: string;
  advertisedRent: string;
  sourceName: string;
  url: string;
  checkedDate: string;
  checkedBy: string;
}

interface Props {
  index: number;
  value: ListingDraft;
  onChange: (next: ListingDraft) => void;
  onRemove: () => void;
  /** Errors keyed by field name, e.g. { url: "Use a full http(s) link" }. */
  errors: Partial<Record<keyof ListingDraft, string>>;
}

export default function ListingFields({ index, value, onChange, onRemove, errors }: Props) {
  const set = (key: keyof ListingDraft) => (v: string) => onChange({ ...value, [key]: v });

  return (
    <fieldset className="rounded-2xl border border-ink bg-paper p-5">
      <div className="flex items-center justify-between">
        <legend className="font-display text-lg font-semibold">Listing {index + 1}</legend>
        <button type="button" onClick={onRemove} className={`${btnText} -mr-2 text-sm`}>
          Remove
        </button>
      </div>

      <div className="mt-3 space-y-4">
        <Field
          label="Street or block"
          hint="Reads “a 2BR/1BA on ___” in the renter's message. No exact address."
          value={value.label}
          onValueChange={set("label")}
          error={errors.label}
          autoComplete="off"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Beds" hint="0 for a studio" inputMode="numeric" value={value.beds} onValueChange={set("beds")} error={errors.beds} />
          <Field label="Baths" inputMode="decimal" value={value.baths} onValueChange={set("baths")} error={errors.baths} />
        </div>
        <Field
          label="Advertised rent"
          hint="Exactly as listed."
          prefix="$"
          suffix="/mo"
          inputMode="decimal"
          value={value.advertisedRent}
          onValueChange={set("advertisedRent")}
          error={errors.advertisedRent}
          autoComplete="off"
        />
        <Field
          label="Source name"
          hint="e.g. Zillow"
          value={value.sourceName}
          onValueChange={set("sourceName")}
          error={errors.sourceName}
          autoComplete="off"
        />
        <Field
          label="Listing URL"
          type="url"
          inputMode="url"
          value={value.url}
          onValueChange={set("url")}
          error={errors.url}
          autoComplete="off"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Date checked"
            type="date"
            value={value.checkedDate}
            onValueChange={set("checkedDate")}
            error={errors.checkedDate}
          />
          <Field
            label="Checked by"
            hint="Initials"
            maxLength={6}
            value={value.checkedBy}
            onValueChange={set("checkedBy")}
            error={errors.checkedBy}
            autoComplete="off"
          />
        </div>
      </div>
    </fieldset>
  );
}
