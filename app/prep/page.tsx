import type { Metadata } from "next";
import AppShell from "@/components/counter/AppShell";
import PrepPage from "@/components/counter/PrepPage";

// Team only. Not linked from anywhere.
export const metadata: Metadata = {
  title: "Prep a case · Counter",
};

export default function Page() {
  return (
    <AppShell>
      <PrepPage />
    </AppShell>
  );
}
