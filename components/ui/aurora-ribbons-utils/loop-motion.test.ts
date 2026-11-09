import { describe, expect, it } from "vitest";
import { loopedRibbonOffset } from "./loop-motion";

const LOOP = 12;
const AMPLITUDE = 0.45; // as used in the hero
const PHASES = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]; // three ribbons on desktop
const XS = Array.from({ length: 29 }, (_, i) => -7 + i * 0.5); // across the 14-unit plane

describe("loopedRibbonOffset", () => {
  it("returns to exactly the same shape every 12 seconds", () => {
    for (const phase of PHASES) {
      for (const t of [0, 0.37, 3, 5.5, 11.99]) {
        for (const x of XS) {
          const a = loopedRibbonOffset(x, t, LOOP, phase, AMPLITUDE);
          for (const k of [1, 2, 10]) {
            const b = loopedRibbonOffset(x, t + k * LOOP, LOOP, phase, AMPLITUDE);
            expect(b.y).toBeCloseTo(a.y, 9);
            expect(b.z).toBeCloseTo(a.z, 9);
          }
        }
      }
    }
  });

  it("has no jump at the loop point: one 60fps frame across it moves no more than one frame elsewhere", () => {
    const frame = 1 / 60;
    const maxStep = (t: number) =>
      Math.max(
        ...PHASES.flatMap((phase) =>
          XS.map((x) => Math.abs(loopedRibbonOffset(x, t + frame, LOOP, phase, AMPLITUDE).y - loopedRibbonOffset(x, t, LOOP, phase, AMPLITUDE).y)),
        ),
      );
    let largestElsewhere = 0;
    for (let t = 0; t < LOOP; t += 0.25) largestElsewhere = Math.max(largestElsewhere, maxStep(t));
    expect(maxStep(LOOP - frame / 2)).toBeLessThanOrEqual(largestElsewhere + 1e-12);
    expect(largestElsewhere).toBeLessThan(0.05); // smooth: well under a twentieth of a unit per frame
  });

  it("visibly changes position and shape within a few seconds", () => {
    for (const phase of PHASES) {
      for (let t = 0; t < LOOP; t += 1) {
        const moved = Math.max(
          ...XS.filter((x) => Math.abs(x) <= 2).map((x) =>
            Math.abs(loopedRibbonOffset(x, t + 3, LOOP, phase, AMPLITUDE).y - loopedRibbonOffset(x, t, LOOP, phase, AMPLITUDE).y),
          ),
        );
        // The visible window spans about +-2 units; ribbons are 1.1 units tall.
        expect(moved).toBeGreaterThan(0.2);
      }
    }
  });

  it("stays within its amplitude, so the clip and fade stay in charge", () => {
    for (const phase of PHASES) {
      for (let t = 0; t < LOOP; t += 0.5) {
        for (const x of XS) {
          const { y } = loopedRibbonOffset(x, t, LOOP, phase, AMPLITUDE);
          expect(Math.abs(y)).toBeLessThanOrEqual(AMPLITUDE * (1 + 0.35 + 0.6) + 1e-9);
        }
      }
    }
  });
});
