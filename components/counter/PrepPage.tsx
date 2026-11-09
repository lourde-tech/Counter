"use client";

import { decodeCase } from "@/lib/link";
import PrepForm from "./PrepForm";
import { useHash } from "./useHash";

/** /prep, or /prep#<payload> to reopen an existing case and fix it. */
export default function PrepPage() {
  const hash = useHash();
  if (hash === null) return <p className="pt-16 text-center text-slate">Loading…</p>;
  return <PrepForm key={hash} initial={decodeCase(hash)} />;
}
