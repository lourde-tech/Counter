import type { Metadata } from "next";
import StepFlow from "@/components/counter/StepFlow";

export const metadata: Metadata = {
  title: "Your renewal · Counter",
};

export default function Page() {
  return <StepFlow />;
}
