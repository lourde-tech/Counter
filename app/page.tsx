import { CounterHero } from "@/components/counter/CounterHero";
import Footer from "@/components/counter/Footer";
import SampleCaseLink from "@/components/counter/SampleCaseLink";
import TeamContact from "@/components/counter/TeamContact";
import { TEAM_CONTACT } from "@/lib/env";

const POINTS = [
  {
    title: "Checked by hand",
    body: "Every listing shows its exact advertised rent, where it was posted, and the day our team checked it.",
  },
  {
    title: "You choose the ask",
    body: "Keep your rent, meet in the middle, ask for a perk, or just ask questions. No scores, no promises.",
  },
  {
    title: "You send it",
    body: "Edit the message, then copy it or open it in your email. Counter never sends anything.",
  },
];

/** Same column as the hero kit's layout, so the header, hero and support copy line up. */
const column = "mx-auto max-w-[1240px] px-[clamp(16px,3.5vw,52px)]";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className={`${column} w-full`}>
        <div className="border-b border-lavender pt-[15px] pb-[13px] font-display text-[27px] leading-[1.2] font-bold tracking-[-0.065em]">
          Counter<span className="text-violet">.</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Full width: the hero's grid sets its own 1240px column. */}
        <CounterHero />

        <section aria-label="How Counter works" className={`${column} mt-12 sm:mt-16`}>
          <div className="grid gap-8 border-t border-ink pt-8 sm:grid-cols-3 sm:gap-10">
            {POINTS.map((p, i) => (
              <div key={p.title}>
                <p className="font-display text-[13px] font-medium tabular-nums text-violet-deep">0{i + 1}</p>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">{p.title}</h2>
                <p className="mt-2 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 leading-relaxed">
            Want to click through the whole flow?{" "}
            <SampleCaseLink className="font-display font-medium underline underline-offset-4 hover:text-violet-deep">
              Open a sample case
            </SampleCaseLink>
            . The listings are made up; enter $1,950 now and $2,100 new.
          </p>
          {TEAM_CONTACT && (
            <p className="mt-3 leading-relaxed">
              Questions? Message us at <TeamContact />.
            </p>
          )}
        </section>
      </main>

      <div className={`${column} w-full pb-16`}>
        <Footer />
      </div>
    </div>
  );
}
