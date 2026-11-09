const currentRent = 1950;
const offeredRent = 2100;
const exampleAsk = 2025;
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const examples = {
  offer: {
    caption: "Landlord’s offer",
    amount: offeredRent,
    baseline: currentRent,
    basisLabel: "Current rent",
    deltaLabel: "current",
  },
  ask: {
    caption: "Example counteroffer",
    amount: exampleAsk,
    baseline: offeredRent,
    basisLabel: "Landlord’s offer",
    deltaLabel: "offer",
  },
};

/** @param {HTMLElement} root */
export function mountCounterHero(root) {
  const scene = root.querySelector("[data-counter-scene]");
  const controls = root.querySelector("[data-counter-controls]");
  const buttons = [...root.querySelectorAll("[data-counter-view]")];
  const cta = root.querySelector("[data-counter-cta]");
  const amount = root.querySelector("[data-counter-amount]");
  const caption = root.querySelector("[data-counter-caption]");
  const delta = root.querySelector("[data-counter-delta]");
  const basis = root.querySelector("[data-counter-basis]");
  const status = root.querySelector("[data-counter-status]");
  const beam = root.querySelector("[data-counter-beam]");
  if (!scene || !controls || !cta || !amount || !caption || !delta || !basis || !status || buttons.length !== 2) {
    return () => {};
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  let active = "offer";
  let displayed = offeredRent;
  let tickerFrame = 0;
  let photoFrame = 0;
  let beamMotion;

  function showAmount(value) {
    displayed = value;
    amount.textContent = currency.format(value);
  }

  function moveAmount(target) {
    cancelAnimationFrame(tickerFrame);
    if (reducedMotion.matches || displayed === target) {
      showAmount(target);
      return;
    }

    const start = displayed;
    const started = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - started) / 480);
      const ease = 1 - (1 - progress) ** 3;
      showAmount(Math.round(start + (target - start) * ease));
      if (progress < 1) tickerFrame = requestAnimationFrame(tick);
    }
    tickerFrame = requestAnimationFrame(tick);
  }

  function selectExample(view) {
    if (view === active) return;
    active = view;
    const example = examples[view];
    const difference = example.amount - example.baseline;
    const absoluteDifference = currency.format(Math.abs(difference));
    const sign = difference < 0 ? "−" : "+";
    const direction = difference < 0 ? "below" : "above";
    const comparison = view === "ask" ? "the landlord’s offer" : "current rent";

    caption.textContent = example.caption;
    delta.textContent = sign + absoluteDifference + " vs. " + example.deltaLabel;
    basis.textContent = example.basisLabel + " " + currency.format(example.baseline) + " / mo";
    status.textContent = example.caption + " of " + currency.format(example.amount) +
      " per month, " + absoluteDifference + " " + direction + " " + comparison + ".";
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.counterView === view));
    }
    moveAmount(example.amount);

    if (!reducedMotion.matches && beam?.animate) {
      beamMotion?.cancel();
      beamMotion = beam.animate(
        [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
        { duration: 690, easing: "cubic-bezier(.2,.7,.2,1)" },
      );
    }
  }

  function resetPhoto() {
    cancelAnimationFrame(photoFrame);
    scene.style.removeProperty("--counter-photo-x");
    scene.style.removeProperty("--counter-photo-y");
  }

  for (const button of buttons) {
    button.addEventListener("click", () => {
      selectExample(button.dataset.counterView === "ask" ? "ask" : "offer");
    }, options);
  }

  cta.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    selectExample("ask");
    scene.focus({ preventScroll: true });
    scene.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "nearest" });
  }, options);

  scene.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== "mouse") return;
    const rect = scene.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(photoFrame);
    photoFrame = requestAnimationFrame(() => {
      scene.style.setProperty("--counter-photo-x", (-x * 12).toFixed(1) + "px");
      scene.style.setProperty("--counter-photo-y", (-y * 12).toFixed(1) + "px");
    });
  }, options);
  scene.addEventListener("pointerleave", resetPhoto, options);
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    cancelAnimationFrame(tickerFrame);
    beamMotion?.cancel();
    resetPhoto();
    showAmount(examples[active].amount);
  }, options);

  controls.hidden = false;
  return () => {
    listeners.abort();
    cancelAnimationFrame(tickerFrame);
    beamMotion?.cancel();
    resetPhoto();
  };
}
