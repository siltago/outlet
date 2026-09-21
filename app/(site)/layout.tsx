import { Analytics } from "@vercel/analytics/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AccessTracker } from "@/components/layout/AccessTracker";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";

// O catálogo lê dados ao vivo do Supabase (produtos podem mudar a qualquer
// momento pelo admin) — nunca deve ser pré-renderizado estaticamente no build.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-brand-black text-brand-white [color-scheme:dark]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloatingButton />
      <AccessTracker />
      <Analytics />
    </div>
  );
}
