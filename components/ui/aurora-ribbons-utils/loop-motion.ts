/**
 * Counter addition to AuroraRibbons: a seamless, repeating ribbon motion.
 *
 * Every term runs at a whole multiple of one cycle (1x, 2x), so the result is
 * exactly periodic in `loopSeconds` and continuous everywhere: the ribbon
 * travels sideways, ripples and bobs up and down, then returns to where it
 * began with no jump. Pure function so it can be tested without WebGL.
 */
export function loopedRibbonOffset(
  x: number,
  elapsedSeconds: number,
  loopSeconds: number,
  phase: number,
  amplitude: number,
): { y: number; z: number } {
  const a = (elapsedSeconds / loopSeconds) * Math.PI * 2;
  const drift = Math.sin(a + phase) * amplitude * 0.6;
  const y =
    Math.sin(x * 0.5 + a + phase) * amplitude +
    Math.sin(x * 0.85 - 2 * a + phase * 1.7) * amplitude * 0.35 +
    drift;
  const z = Math.cos(x * 0.35 + a + phase) * 0.5;
  return { y, z };
}
