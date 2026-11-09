import Footer from "@/components/counter/Footer";
import LandingHero from "@/components/counter/LandingHero";
import TeamContact from "@/components/counter/TeamContact";
import { DecorativeBoundary } from "@/components/counter/decorative";
import { GlassFold } from "@/components/ui/glass-fold";
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
        <div className="border-b border-lavender pt-[15px] pb-[13px] font-system text-[27px] leading-[1.2] font-bold tracking-[-0.035em]">
          Counter<span className="text-violet">.</span>
        </div>
      </header>

      <main className="flex-1">
        {/* Full width: the hero's grid sets its own 1240px column. */}
        <LandingHero />

        <section id="how-it-works" aria-labelledby="how-it-works-title" className={`${column} mt-12 scroll-mt-6 sm:mt-16`}>
          {/*
            A black panel with violet glass folding in it. The text never sits on the bright glass:
            on phones the glass is a band above the steps, on wide screens it fills the right half.
            Each edge of the glass fades into the black. Without WebGL the panel is plain black.
          */}
          <div className="overflow-hidden rounded-[24px] bg-ink text-paper lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div
              aria-hidden="true"
              data-counter-glass
              className="pointer-events-none relative h-[200px] [mask-image:linear-gradient(to_bottom,black_50%,transparent)] sm:h-[240px] lg:order-2 lg:h-auto lg:[mask-image:linear-gradient(to_right,transparent,black_40%)]"
            >
              <div className="absolute inset-0">
                <DecorativeBoundary>
                  <GlassFold color1="#6638D8" color2="#000000" color3="#F1EBFF" speed={0.5} scale={1} noise={0.12} />
                </DecorativeBoundary>
              </div>
            </div>

            <div className="relative -mt-10 px-6 pb-10 sm:-mt-12 sm:px-12 sm:pb-14 lg:mt-0 lg:py-14">
              <h2 id="how-it-works-title" className="font-system text-[clamp(32px,4.5vw,56px)] leading-[1.05] font-bold tracking-[-0.04em]">
                How it works
              </h2>
              <div className="mt-8 grid gap-8 border-t border-violet pt-8 sm:grid-cols-3 sm:gap-10 lg:mt-10 lg:grid-cols-1 lg:gap-9">
                {POINTS.map((p, i) => (
                  <div key={p.title}>
                    <p className="font-display text-[13px] font-medium tabular-nums text-lavender">0{i + 1}</p>
                    <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">{p.title}</h3>
                    <p className="mt-2 leading-relaxed">{p.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-10 leading-relaxed">
            The sample case uses made-up listings. To walk through it, enter $1,950 now and $2,100 new.
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
