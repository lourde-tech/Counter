import Footer from "./Footer";

/** The narrow mobile column used by the renter flow and the team prep page. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-24">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
