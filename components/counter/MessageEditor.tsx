import { useId, type Ref } from "react";
import { SIGN_OFF_PLACEHOLDER, wordCount } from "@/lib/templates";
import { input, label } from "./styles";

interface Props {
  subject: string;
  body: string;
  onChange: (next: { subject: string; body: string }) => void;
  bodyRef?: Ref<HTMLTextAreaElement>;
}

export default function MessageEditor({ subject, body, onChange, bodyRef }: Props) {
  const subjectId = useId();
  const bodyId = useId();
  const words = wordCount(body);
  const hasPlaceholder = body.includes(SIGN_OFF_PLACEHOLDER);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={subjectId} className={label}>
          Subject
        </label>
        <input
          id={subjectId}
          value={subject}
          onChange={(e) => onChange({ subject: e.target.value, body })}
          className={`${input} mt-1.5`}
          autoComplete="off"
        />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor={bodyId} className={label}>
            Message
          </label>
          <span className="font-display text-[13px] font-medium text-ink tabular-nums">{words} words</span>
        </div>
        <textarea
          id={bodyId}
          ref={bodyRef}
          value={body}
          onChange={(e) => onChange({ subject, body: e.target.value })}
          rows={18}
          className="mt-1.5 block w-full resize-y rounded-xl border border-ink bg-paper p-3 text-base leading-relaxed text-ink [field-sizing:content] min-h-80"
        />
        {hasPlaceholder && (
          <p className="mt-2 text-sm text-violet-deep">
            Replace {SIGN_OFF_PLACEHOLDER} with your name and unit before you send it.
          </p>
        )}
      </div>
    </div>
  );
}
