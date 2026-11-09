# Counter (demo)

A mobile demo for one hypothesis: Philadelphia renters facing an active rent increase will send their landlord a
counteroffer when we hand them hand-verified comparable listings and a message they control.

No AI, no server, no database. Our team verifies up to 3 listings by hand and creates a private link. The renter
sees the evidence, chooses what to ask for, edits the message and decides whether to send it. Counter never sends
anything.

## Routes

| Route       | Who         | What                                                                                     |
| ----------- | ----------- | ---------------------------------------------------------------------------------------- |
| `/prep`     | Team only   | Enter the unit and 0–3 verified listings, get a `/c#…` link and a QR code. Not linked anywhere. |
| `/prep#…`   | Team only   | Paste a case payload after `#` to reopen and fix it.                                      |
| `/c#…`      | Renter      | Welcome → offer → evidence → ask → message → decision.                                     |
| `/`         | Anyone      | A short note pointing renters to their link.                                              |

## Privacy

- The case (unit label, listings, team note) lives in the URL hash. Browsers never send the hash to a server.
- Everything the renter types stays in React state and is gone when the tab closes.
- The only thing that leaves the page is the optional feedback form, and only when the renter taps
  "Let the Counter team know" and submits it. It carries the case code, decision, copied / email opened / edited
  (yes or no), ask type, thin evidence (yes or no) and stop reasons. Never rents, names, listings or message text.

## How the comparison works (`lib/compare.ts`)

- Increase, per-listing difference, median, and where the new rent sits (above all, within, below all).
- **Thin evidence** if any of these fire: fewer than 3 listings, a different bedroom count, a listing checked more
  than 21 days ago, or a spread wider than 25% of the median. Thin evidence pre-selects the general renewal inquiry.
- **Asks:** keep current rent, meet in the middle (nearest $5), match the listings (median, nearest $5), a perk
  instead, or a general inquiry with no number.
- **One suggestion:** when the rent is going up, the evidence isn't thin, and the median is at or below what the
  renter pays now, "Keep my current rent" is suggested and pre-selected, the median is shown in the reason, and
  "Match the listings" is hidden. Thin evidence still wins.
- Match the listings is only offered when its number is above the current rent and below the offer.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3000/prep
```

### Environment variables

| Name                            | Example                                                    |
| ------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_TEAM_CONTACT`      | `team@example.com` or `(215) 555-0134`                     |
| `NEXT_PUBLIC_FEEDBACK_FORM_URL` | `https://docs.google.com/forms/d/e/…/viewform`             |
| `NEXT_PUBLIC_FORM_ENTRY_IDS`    | `{"caseCode":"entry.1","decision":"entry.2",…}`            |

These are baked in at build time. On Vercel, set them in Project Settings → Environment Variables, then redeploy.

### Google Form

1. Create a form with eight **Short answer** questions: case code, decision, copied, email opened, edited, ask type,
   thin evidence, stop reasons.
2. In the form menu choose **Get pre-filled link**, type anything in each field, and copy the link.
3. Each field appears as `entry.123456=…` in that link. Put those IDs into `NEXT_PUBLIC_FORM_ENTRY_IDS` under the
   keys `caseCode`, `decision`, `copied`, `emailOpened`, `edited`, `askType`, `thinEvidence`, `stopReasons`.

Values arrive as the text the renter saw (for example "Not sending", "Keep my current rent"), `yes`/`no` for the
flags, and stop reasons joined with `; `.

## Commands

```bash
npm test            # vitest: comparison logic, templates, link, feedback, offer form
npm run typecheck
npm run lint
npm run build       # static export to out/
```

## Deploy

Vercel, framework preset Next.js. `next.config.ts` sets `output: "export"`, so the build is fully static.

## Before the demo: device check

Run one real renewal case (from a consenting renter) end to end at 375px on **iPhone Safari** and
**Android Chrome**:

- [ ] `/prep` link opens on the phone; QR code scans
- [ ] Copy message pastes into Messages / Mail
- [ ] "Open in my email app" opens a draft with the subject and line breaks intact
- [ ] Listing links open the source site
- [ ] 0 listings, 1 listing, mismatched bedrooms and a stale listing each show "The evidence is limited" and
      pre-select the general inquiry
- [ ] Feedback form opens prefilled with no rents, names or message text

Counter isn't a lawyer or licensed agent. You choose what to ask for and you decide whether to send it.
