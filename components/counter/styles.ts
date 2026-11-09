/** Design-system class strings, so every screen uses the same buttons and cards. */

export const card = "rounded-2xl border border-line bg-white/60 p-5";

const button =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-base transition-colors duration-200 disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

export const btnPrimary = `${button} bg-ink text-paper font-medium hover:bg-ember`;

export const btnSecondary = `${button} border border-ink/15 hover:bg-sand`;

/** Quiet text button, still a 44px tap target. */
export const btnText =
  "inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-base text-slate underline-offset-4 hover:text-ink hover:underline";

export const figure = "font-display tabular-nums";

export const heading = "font-display text-[1.75rem] leading-tight font-semibold tracking-tight";

export const input =
  "block h-12 w-full rounded-xl border border-line bg-white px-3 text-base text-ink placeholder:text-slate/60 focus:border-ink focus:outline-none aria-invalid:border-ember";

export const label = "block text-sm font-medium text-ink";

export const hint = "mt-1 text-sm text-slate";

export const errorText = "mt-1 text-sm text-ember";
