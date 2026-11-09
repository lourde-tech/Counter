import type { Metadata } from "next";
import AppShell from "@/components/counter/AppShell";
import StepFlow from "@/components/counter/StepFlow";

export const metadata: Metadata = {
  title: "Your renewal · Counter",
};

export default function Page() {
  return (
    <AppShell>
      <StepFlow />
    </AppShell>
  );
}
