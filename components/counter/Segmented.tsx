import { useId } from "react";
import { label as labelClass } from "./styles";

interface SegmentedProps<T extends string> {
  label: React.ReactNode;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** A row of radio buttons styled as a segmented control. */
export default function Segmented<T extends string>({ label, options, value, onChange, className }: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset className={className}>
      <legend className={labelClass}>{label}</legend>
      <div className="mt-1.5 flex rounded-full border border-line bg-white p-1">
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <label
              key={o.value}
              className={`relative flex min-h-10 flex-1 cursor-pointer items-center justify-center rounded-full px-2 text-center text-sm transition-colors duration-200 has-focus-visible:outline-2 has-focus-visible:outline-ember ${
                checked ? "bg-ink text-paper font-medium" : "text-ink hover:bg-sand"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
