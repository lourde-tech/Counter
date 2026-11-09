import { buildMailto } from "@/lib/share";
import { btnSecondary } from "./styles";

/** A plain link so iOS and Android hand it straight to the mail app. No recipient: the renter adds it. */
export default function OpenEmailButton({ subject, body, onOpened }: { subject: string; body: string; onOpened: () => void }) {
  return (
    <a href={buildMailto(subject, body)} onClick={onOpened} className={btnSecondary}>
      Open in my email app
    </a>
  );
}
