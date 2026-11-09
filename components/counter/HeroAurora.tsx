"use client";

import dynamic from "next/dynamic";
import { DecorativeBoundary, useMediaQuery, useMotionAllowed, useWebGL } from "./decorative";

/*
 * Decorative violet ribbons inside the hero's rowhouse photo.
 * Mounted only in the browser, only when motion is allowed and WebGL works.
 * Anything that goes wrong (no WebGL, a failed chunk, a renderer error)
 * renders nothing, leaving the photo, connector and phone untouched.
 */

const AuroraRibbons = dynamic(() => import("@/components/ui/aurora-ribbons"), {
  ssr: false,
  loading: () => null,
});

export default function HeroAurora() {
  const motion = useMotionAllowed();
  const webgl = useWebGL("webgl");
  /** Same breakpoint as the hero's mobile layout in counter-hero.css. */
  const small = useMediaQuery("(max-width: 760px)");

  const showAurora = motion && webgl;
  if (!showAurora) return null;

  return (
    <div
      aria-hidden="true"
      data-counter-aurora
      data-ribbons={small ? 2 : 3}
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-25 [mask-image:linear-gradient(to_bottom,transparent_20%,black_75%)]"
    >
      {/*
        The ribbons render around the canvas's vertical middle. On desktop that is the middle of the
        photo, so the canvas is shifted down by 22% to put them in the lower portion; the clipped
        wrapper trims the overflow. On mobile they already sit low, so no shift.
      */}
      <div className="absolute inset-x-0 top-0 h-full min-[761px]:top-[22%]">
        <DecorativeBoundary>
          <AuroraRibbons className="h-full w-full" ribbons={small ? 2 : 3} speed={0.35} amplitude={0.45} theme="light" environment="none" />
        </DecorativeBoundary>
      </div>
    </div>
  );
}
