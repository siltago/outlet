import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | Importados e produtos de oportunidade`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: SITE_NAME,
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/images/brand/og-image.jpg", width: 1200, height: 1200, alt: SITE_NAME }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-brand-white text-brand-black">{children}</body>
    </html>
  );
}
