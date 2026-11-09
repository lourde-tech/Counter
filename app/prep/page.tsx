import type { Metadata } from "next";
import PrepPage from "@/components/counter/PrepPage";

// Team only. Not linked from anywhere.
export const metadata: Metadata = {
  title: "Prep a case · Counter",
};

export default function Page() {
  return <PrepPage />;
}
