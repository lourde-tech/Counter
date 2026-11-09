"use client";

import { useSyncExternalStore } from "react";
import { encodeCase } from "@/lib/link";
import { sampleCase } from "@/lib/sample";
import { CounterHero } from "./CounterHero";

const subscribe = () => () => {};

let sampleHref: string | null = null;

/**
 * The existing sample-case destination: /c#<sample case>. Built in the browser so the
 * sample's "checked" dates are recent (a link baked in at build time would turn stale
 * after 21 days). Before hydration the button points at /c.
 */
function clientSampleHref(): string {
  sampleHref ??= `/c#${encodeCase(sampleCase())}`;
  return sampleHref;
}

export default function LandingHero() {
  const href = useSyncExternalStore(subscribe, clientSampleHref, () => "/c");
  return <CounterHero sampleHref={href} />;
}
