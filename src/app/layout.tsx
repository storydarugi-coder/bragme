import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { NotificationPoller } from "@/components/NotificationPoller";
import { NotificationToast } from "@/components/NotificationToast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://bragme.app",
  ),
  title: {
    default: "BragMe — Spill your mess. We'll find your magic.",
    template: "%s · BragMe",
  },
  description:
    "Dump your mess. Get a glow-up brag card. Share the main character energy.",
  openGraph: {
    title: "BragMe",
    description: "Spill your mess. We'll find your magic.",
    type: "website",
    siteName: "BragMe",
  },
  twitter: {
    card: "summary_large_image",
    title: "BragMe",
    description: "Spill your mess. We'll find your magic.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Run before paint to avoid theme flash. Reads localStorage and
         * applies the saved theme class to <html> synchronously. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bragme:theme');if(t==='dark'||t==='light'){document.documentElement.classList.add('theme-'+t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TopBar />
        {children}
        <Footer />
        <KeyboardShortcuts />
        <NotificationPoller />
        <NotificationToast />
      </body>
    </html>
  );
}
