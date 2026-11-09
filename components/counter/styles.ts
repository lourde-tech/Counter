/** Design-system class strings, so every screen uses the same buttons and cards. */

export const card = "rounded-2xl border border-ink bg-paper p-5";

/** Compact panels for the comparables: 14px padding and radius, 6px between rows. */
export const panel = "flex flex-col gap-[6px] rounded-[14px] border border-ink bg-paper p-[14px]";

const button =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 font-display text-base font-medium transition-colors duration-200 disabled:pointer-events-none";

/** One per screen. Violet fill, white text, deep violet on hover. */
export const btnPrimary = `${button} bg-violet text-paper hover:bg-violet-deep disabled:bg-lavender disabled:text-violet-deep`;

/** White with black text and a 1px black border. */
export const btnSecondary = `${button} border border-ink bg-paper text-ink hover:bg-lavender`;

/** Quiet text button, still a 44px tap target. */
export const btnText =
  "inline-flex min-h-11 items-center gap-1 rounded-full px-2 font-display text-base font-medium text-ink underline-offset-4 hover:text-violet-deep hover:underline";

export const figure = "font-display tabular-nums";

export const heading = "font-display text-[1.75rem] leading-tight font-semibold tracking-tight";

/** Compact labels and card rows: Space Grotesk, 13px, medium. */
export const rowLabel = "font-display text-[13px] font-medium text-ink";

export const input =
  "block h-12 w-full rounded-xl border border-ink bg-paper px-3 text-base text-ink aria-invalid:border-2 aria-invalid:border-violet-deep";

export const label = `block ${rowLabel}`;

export const hint = "mt-1 text-sm text-ink";

export const errorText = "mt-1 text-sm font-medium text-violet-deep";
