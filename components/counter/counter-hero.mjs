const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** @param {HTMLElement} root */
export function mountCounterHero(root) {
  const scene = root.querySelector("[data-counter-scene]");
  const cta = root.querySelector("[data-counter-cta]");
  const status = root.querySelector("[data-counter-status]");
  const beam = root.querySelector("[data-counter-beam]");
  const choices = [...root.querySelectorAll("[data-counter-choice]")];
  let selected = choices.find((choice) => choice.getAttribute("aria-pressed") === "true");
  if (!scene || !status || !selected) return () => {};

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  let displayed = Number(selected.querySelector("[data-counter-amount]")?.dataset.counterAmount ?? 2100);
  let amountFrame = 0;
  let photoFrame = 0;
  let beamMotion;

  function trace() {
    if (motion.matches || !beam?.animate) return;
    beamMotion?.cancel();
    beamMotion = beam.animate(
      [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }],
      { duration: 760, easing: "cubic-bezier(.2,.7,.2,1)" },
    );
  }

  function renderAmount(node, value) {
    displayed = value;
    node.textContent = currency.format(value);
  }

  function moveAmount(node, target) {
    if (motion.matches || displayed === target) {
      renderAmount(node, target);
      return;
    }
    const start = displayed;
    const started = performance.now();
    renderAmount(node, start);
    function tick(now) {
      const progress = Math.min(1, (now - started) / 480);
      const ease = 1 - (1 - progress) ** 3;
      renderAmount(node, Math.round(start + (target - start) * ease));
      if (progress < 1) amountFrame = requestAnimationFrame(tick);
    }
    amountFrame = requestAnimationFrame(tick);
  }

  function select(choice) {
    if (choice === selected) return;
    cancelAnimationFrame(amountFrame);
    selected.setAttribute("aria-pressed", "false");
    choice.setAttribute("aria-pressed", "true");
    selected = choice;
    const amount = selected.querySelector("[data-counter-amount]");
    const target = amount ? Number(amount.dataset.counterAmount) : null;
    if (amount && target !== null) moveAmount(amount, target);
    const label = selected.dataset.counterChoice;
    status.textContent = target === null
      ? label + " selected."
      : label + " selected. " + currency.format(target) + " per month.";
    trace();
  }

  function resetPhoto() {
    cancelAnimationFrame(photoFrame);
    scene.style.removeProperty("--counter-photo-x");
    scene.style.removeProperty("--counter-photo-y");
  }

  for (const choice of choices) {
    choice.addEventListener("click", () => select(choice), options);
  }

  cta?.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    selected.focus({ preventScroll: true });
    scene.scrollIntoView({ behavior: motion.matches ? "instant" : "smooth", block: "nearest" });
    trace();
  }, options);

  scene.addEventListener("pointermove", (event) => {
    if (motion.matches || !pointer.matches || event.pointerType !== "mouse") return;
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

  motion.addEventListener("change", () => {
    if (!motion.matches) return;
    cancelAnimationFrame(amountFrame);
    beamMotion?.cancel();
    resetPhoto();
    const amount = selected.querySelector("[data-counter-amount]");
    if (amount) renderAmount(amount, Number(amount.dataset.counterAmount));
  }, options);

  return () => {
    listeners.abort();
    cancelAnimationFrame(amountFrame);
    beamMotion?.cancel();
    resetPhoto();
  };
}
