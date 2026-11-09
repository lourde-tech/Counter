import Footer from "@/components/counter/Footer";
import ProductPreview from "@/components/counter/ProductPreview";
import SampleCaseLink from "@/components/counter/SampleCaseLink";
import TeamContact from "@/components/counter/TeamContact";
import { btnPrimary, rowLabel } from "@/components/counter/styles";
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

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 pb-16 sm:px-8">
      <header className="flex h-16 items-center justify-between sm:h-20">
        <span className="font-display text-xl font-semibold tracking-tight">Counter</span>
        <span className={rowLabel}>Pilot in Philadelphia</span>
      </header>

      <main className="flex-1">
        <section className="grid items-center gap-14 pt-8 pb-4 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-20 lg:pt-16">
          <div>
            <p className="font-display text-[13px] font-medium text-violet-deep">For renters with a rent increase</p>
            <h1 className="mt-4 font-display text-[42px] leading-[1.02] font-semibold tracking-[-0.03em] sm:text-[60px] lg:text-[68px]">
              Your rent went up. Push back with real listings.
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed sm:text-xl">
              Our team checks nearby listings by hand. You see the evidence, choose what to ask for, and get a message
              you edit and send yourself.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <SampleCaseLink className={`${btnPrimary} sm:w-auto sm:px-9`}>Try a sample case</SampleCaseLink>
              <p className="text-base">Got a link from our team? Open it to start.</p>
            </div>
            <p className={`mt-4 ${rowLabel}`}>Sample case: enter $1,950 now and $2,100 new. The listings are made up.</p>
          </div>

          <ProductPreview />
        </section>

        <section aria-label="How Counter works" className="mt-20 grid gap-8 border-t border-ink pt-8 sm:grid-cols-3 sm:gap-10 lg:mt-28">
          {POINTS.map((p, i) => (
            <div key={p.title}>
              <p className="font-display text-[13px] font-medium tabular-nums text-violet-deep">0{i + 1}</p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">{p.title}</h2>
              <p className="mt-2 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </section>

        {TEAM_CONTACT && (
          <p className="mt-12 text-lg">
            Questions? Message us at <TeamContact />.
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
