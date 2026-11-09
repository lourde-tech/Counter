import { heading } from "./styles";

/** Each step's title. Takes focus when the step mounts so screen readers announce the new step. */
export default function StepHeading({ children, kicker }: { children: React.ReactNode; kicker?: string }) {
  return (
    <div className="mb-6">
      {kicker && <p className="mb-2 text-sm font-medium text-ember">{kicker}</p>}
      <h1 tabIndex={-1} ref={(el) => el?.focus({ preventScroll: true })} className={`${heading} outline-none`}>
        {children}
      </h1>
    </div>
  );
}
