"use client";

import { useRouter } from "next/navigation";
import { encodeCase } from "@/lib/link";
import { sampleCase } from "@/lib/sample";

/** Opens the labeled sample case. The link is built on tap so its "checked" dates are always recent. */
export default function SampleCaseLink({ className, children }: { className: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <a
      href="/c"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        router.push(`/c#${encodeCase(sampleCase())}`);
      }}
    >
      {children}
    </a>
  );
}
