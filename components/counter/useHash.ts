"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/** The URL hash, or null while prerendering (the hash only exists in the browser). */
export function useHash(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash,
    () => null,
  );
}
