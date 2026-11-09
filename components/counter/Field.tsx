import { useId } from "react";
import { errorText, hint as hintClass, input as inputClass, label as labelClass } from "./styles";

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
};

interface FieldProps extends InputProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  /** Shown inside the input on the left, e.g. "$". */
  prefix?: string;
  /** Shown inside the input on the right, e.g. "/mo". */
  suffix?: string;
}

/** Label + input + hint + error, wired up for screen readers. Inputs are 16px so iOS doesn't zoom. */
export default function Field({ label, hint, error, prefix, suffix, value, onValueChange, className, ...rest }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative mt-1.5">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate">{prefix}</span>
        )}
        <input
          id={id}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} ${prefix ? "pl-7" : ""} ${suffix ? "pr-12" : ""}`}
          {...rest}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate">{suffix}</span>
        )}
      </div>
      {hint && (
        <p id={hintId} className={hintClass}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={errorText}>
          {error}
        </p>
      )}
    </div>
  );
}
