import { contactHref, TEAM_CONTACT } from "@/lib/env";

/** The team contact as a tappable link, or a plain fallback if it isn't configured. */
export default function TeamContact() {
  if (!TEAM_CONTACT) return <>the contact our team gave you</>;
  const href = contactHref(TEAM_CONTACT);
  if (!href) return <span className="font-medium">{TEAM_CONTACT}</span>;
  return (
    <a href={href} className="font-medium text-ink underline underline-offset-4 hover:text-violet-deep">
      {TEAM_CONTACT}
    </a>
  );
}
