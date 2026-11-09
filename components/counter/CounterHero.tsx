"use client";

import { useEffect, useRef } from "react";
import { mountCounterHero } from "./counter-hero.mjs";

type CounterHeroProps = { sampleHref?: string };

export function CounterHero({ sampleHref }: CounterHeroProps) {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (hero) return mountCounterHero(hero);
  }, [sampleHref]);

  return (
    <section ref={heroRef} className="counter-hero" data-counter-hero aria-labelledby="counter-hero-title">
      <div className="counter-hero__layout">
        <div className="counter-hero__intro">
          <p className="counter-hero__eyebrow">For renters with a rent increase</p>
          <h1 id="counter-hero-title">Your rent went up.<br />Push back with real listings.</h1>
          <p className="counter-hero__lede">Our team checks nearby listings by hand. You choose what to ask for and get a message you can edit and send.</p>
          <div className="counter-hero__actions">
            <a className="counter-hero__cta" href={sampleHref ?? "#counter-renewal-example"} data-counter-cta={sampleHref ? undefined : ""}>Try a sample case</a>
            <p className="counter-hero__invite">Got a link from our team? Open it to start.</p>
          </div>
        </div>

        <figure id="counter-renewal-example" className="counter-hero__scene" data-counter-scene tabIndex={-1} aria-labelledby="counter-example-title">
          <div className="counter-hero__photo">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export: no image optimizer, and the WebP is already sized */}
            <img src="/images/counter-rowhouses.webp" width={1040} height={1300} alt="" decoding="async" />
          </div>
          <svg className="counter-hero__path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path className="counter-hero__path-track" d="M 89 27 V 39 Q 89 45 83 45 H 80 Q 76 45 76 51 V 57 H 48" vectorEffect="non-scaling-stroke"></path>
            <path className="counter-hero__path-trace" data-counter-beam pathLength={1} d="M 89 27 V 39 Q 89 45 83 45 H 80 Q 76 45 76 51 V 57 H 48" vectorEffect="non-scaling-stroke"></path>
          </svg>
          <span className="counter-hero__marker" aria-hidden="true"></span>

          <figcaption className="counter-hero__phone">
            <div className="counter-hero__phone-screen">
              <div className="counter-hero__island" aria-hidden="true"></div>
              <div className="counter-hero__phone-heading">
                <p>Counter</p>
                <span>Sample case</span>
              </div>
              <div className="counter-hero__progress" aria-hidden="true"></div>
              <div className="counter-hero__renewal">
                <p id="counter-example-title">Example renewal</p>
                <dl>
                  <div><dt>Current rent</dt><dd>$1,950 <small>/ mo</small></dd></div>
                  <div><dt>Proposed rent</dt><dd>$2,100 <small>/ mo</small></dd></div>
                </dl>
              </div>
              <div className="counter-hero__listings">
                <p>Sample nearby listings</p>
                <div><span>$1,895</span><span>$1,950</span><span>$1,990 <small>/ mo</small></span></div>
              </div>
              <p className="counter-hero__choice-heading" id="counter-ask-title">Choose what to ask for</p>
              <div className="counter-hero__choices" role="group" aria-labelledby="counter-ask-title">
                <button type="button" className="counter-hero__choice" data-counter-choice="Keep my current rent" aria-pressed="true" aria-labelledby="counter-keep-label">
                  <span className="counter-hero__choice-label" id="counter-keep-label">Keep my current rent</span>
                  <span className="counter-hero__choice-details">
                    <span className="counter-hero__ask-amount"><span data-counter-amount="1950">$1,950</span> <small>/ mo</small></span>
                    <span>If accepted, save $150/mo.</span>
                  </span>
                </button>
                <button type="button" className="counter-hero__choice" data-counter-choice="Meet in the middle" aria-pressed="false" aria-labelledby="counter-middle-label">
                  <span className="counter-hero__choice-label" id="counter-middle-label">Meet in the middle</span>
                  <span className="counter-hero__choice-details">
                    <span className="counter-hero__ask-amount"><span data-counter-amount="2025">$2,025</span> <small>/ mo</small></span>
                    <span>If accepted, save $75/mo.</span>
                  </span>
                </button>
                <button type="button" className="counter-hero__choice" data-counter-choice="Ask for a perk" aria-pressed="false" aria-labelledby="counter-perk-label">
                  <span className="counter-hero__choice-label" id="counter-perk-label">Ask for a perk</span>
                  <span className="counter-hero__choice-details"><span className="counter-hero__choice-feature">Pick a perk to request</span><span>For example, ask about parking.</span></span>
                </button>
                <button type="button" className="counter-hero__choice" data-counter-choice="Ask questions" aria-pressed="false" aria-labelledby="counter-questions-label">
                  <span className="counter-hero__choice-label" id="counter-questions-label">Ask questions</span>
                  <span className="counter-hero__choice-details"><span className="counter-hero__choice-feature">Get more context</span><span>Ask what changed in the renewal.</span></span>
                </button>
              </div>
              <div className="counter-hero__home-indicator" aria-hidden="true"></div>
              <p className="counter-hero__sr" data-counter-status aria-live="polite">Keep my current rent selected. $1,950 per month.</p>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
