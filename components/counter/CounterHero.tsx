"use client";

import { useEffect, useRef } from "react";
import { mountCounterHero } from "./counter-hero.mjs";

export function CounterHero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (hero) return mountCounterHero(hero);
  }, []);

  return (
    <section ref={heroRef} className="counter-hero" data-counter-hero aria-labelledby="counter-hero-title">
      <div className="counter-hero__layout">
        <div className="counter-hero__intro">
          <p className="counter-hero__eyebrow"><span aria-hidden="true"></span> Philadelphia rent renewal pilot</p>
          <h1 id="counter-hero-title">Rent went up?<br /><span>You can counter.</span></h1>
          <p className="counter-hero__lede">Our team finds nearby rentals to compare. You choose what to ask for and get a draft you can edit and send.</p>
          <a className="counter-hero__cta" href="#counter-renewal-example" data-counter-cta>
            See an example <span aria-hidden="true">↘</span>
          </a>
          <p className="counter-hero__invite">Have an invite? Open the link our team sent you.</p>
        </div>

        <figure id="counter-renewal-example" className="counter-hero__scene" data-counter-scene tabIndex={-1} aria-labelledby="counter-example-title">
          <div className="counter-hero__photo">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export: no image optimizer, and the WebP is already sized */}
            <img src="/images/counter-rowhouses.webp" width={1040} height={1300} alt="Illustrative Philadelphia-style brick rowhouses" decoding="async" fetchPriority="high" />
          </div>
          <span className="counter-hero__location"><span aria-hidden="true"></span> Philadelphia, PA</span>
          <svg className="counter-hero__path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path className="counter-hero__path-track" d="M 78 24 V 35 Q 78 42 69 42 H 42 Q 34 42 34 50 V 64" vectorEffect="non-scaling-stroke"></path>
            <path className="counter-hero__path-trace" data-counter-beam pathLength={1} d="M 78 24 V 35 Q 78 42 69 42 H 42 Q 34 42 34 50 V 64" vectorEffect="non-scaling-stroke"></path>
          </svg>
          <span className="counter-hero__marker" aria-hidden="true"></span>

          <figcaption className="counter-hero__card">
            <div className="counter-hero__card-heading">
              <p id="counter-example-title">Example renewal</p>
              <span>Illustrative</span>
            </div>
            <p className="counter-hero__scenario" data-counter-caption>Landlord’s offer</p>
            <div className="counter-hero__amount-row" aria-hidden="true">
              <p className="counter-hero__amount"><span data-counter-amount>$2,100</span> <small>/ mo</small></p>
              <span className="counter-hero__delta" data-counter-delta>+$150 vs. current</span>
            </div>
            <p className="counter-hero__basis" data-counter-basis>Current rent $1,950 / mo</p>
            <p className="counter-hero__sr" data-counter-status aria-live="polite">Illustrative landlord’s offer of $2,100 per month, $150 above current rent.</p>
            <div className="counter-hero__switch" data-counter-controls role="group" aria-label="Explore the renewal example" hidden>
              <button type="button" data-counter-view="offer" aria-pressed="true">Renewal offer</button>
              <button type="button" data-counter-view="ask" aria-pressed="false">Example counteroffer</button>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
