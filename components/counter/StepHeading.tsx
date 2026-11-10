import { heading } from "./styles";

/*
 * Defined once, outside the component, so React sees the same function on every
 * render and calls it only when the heading mounts. An inline arrow here would
 * be a new function each render, which makes React call it again: the heading
 * would then take focus on every keystroke and pull it out of the field being
 * typed in.
 */
function focusOnMount(el: HTMLHeadingElement | null) {
  el?.focus({ preventScroll: true });
}

/** Each step's title. Takes focus once, when the step mounts, so screen readers announce the new step. */
export default function StepHeading({ children, kicker }: { children: React.ReactNode; kicker?: string }) {
  return (
    <div className="mb-6">
      {kicker && <p className="mb-2 font-display text-[13px] font-medium text-violet-deep">{kicker}</p>}
      <h1 tabIndex={-1} ref={focusOnMount} className={`${heading} outline-none`}>
        {children}
      </h1>
    </div>
  );
}
