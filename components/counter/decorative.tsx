"use client";

import { Component, useSyncExternalStore, type ReactNode } from "react";

/*
 * Shared guards for the landing page's decorative WebGL effects (the aurora
 * ribbons in the photo and the moving mesh background). Each effect mounts
 * only in the browser, only when motion is allowed and the needed WebGL
 * version exists, and inside an error boundary that renders nothing if the
 * effect fails. The page underneath is complete without them.
 */

function subscribeMedia(query: string) {
  return (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  };
}

const subscribers = new Map<string, (onChange: () => void) => () => void>();

/** A media query, false while prerendering. */
export function useMediaQuery(query: string, serverValue = false): boolean {
  let subscribe = subscribers.get(query);
  if (!subscribe) {
    subscribe = subscribeMedia(query);
    subscribers.set(query, subscribe);
  }
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => serverValue);
}

/** True only in the browser when the visitor hasn't asked for reduced motion. */
export function useMotionAllowed(): boolean {
  return !useMediaQuery("(prefers-reduced-motion: reduce)", true);
}

const support: { webgl?: boolean; webgl2?: boolean } = {};

function probe(kind: "webgl" | "webgl2"): boolean {
  if (support[kind] === undefined) {
    try {
      const canvas = document.createElement("canvas");
      support[kind] = Boolean(kind === "webgl2" ? canvas.getContext("webgl2") : (canvas.getContext("webgl2") ?? canvas.getContext("webgl")));
    } catch {
      support[kind] = false;
    }
  }
  return support[kind]!;
}

const noSubscribe = () => () => {};

/** Whether this browser can create the given WebGL context. False while prerendering. */
export function useWebGL(kind: "webgl" | "webgl2" = "webgl"): boolean {
  return useSyncExternalStore(noSubscribe, () => probe(kind), () => false);
}

/** Renders nothing if a decorative child throws (no WebGL, failed chunk, renderer error). */
export class DecorativeBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Decorative only: drop the effect and keep the page as it is.
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
