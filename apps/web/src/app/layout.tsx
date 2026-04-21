import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { CookieBanner } from "@/components/cookie-banner";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://otosonar.com"),
  title: "OtoSonar — AI destekli araç analiz platformu",
  description:
    "Sahibinden ve arabam.com ilanlarını saniyeler içinde analiz et. Emsal değer, gizli arıza, pazarlık skoru ve günlük 5 fırsat — galericiler ve araç alıcıları için.",
  applicationName: "OtoSonar",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon-32.png",
  },
  appleWebApp: {
    capable: true,
    title: "OtoSonar",
    statusBarStyle: "black-translucent",
    startupImage: "/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    "araç analiz",
    "oto zeka",
    "galerici yazılımı",
    "emsal değer",
    "ikinci el araç",
    "sahibinden analiz",
    "arabam analiz",
  ],
  authors: [{ name: "NiVector" }],
  openGraph: {
    title: "OtoSonar — AI destekli araç analizi",
    description:
      "İlanı 10 saniyede analiz et. Emsal değer, gizli arıza, pazarlık skoru, günlük fırsat.",
    locale: "tr_TR",
    type: "website",
    siteName: "OtoSonar",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "OtoSonar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OtoSonar — AI araç analizi",
    description: "İlanı 10 saniyede analiz et.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0a0f" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        {children}
        <ServiceWorkerRegister />
        <AnalyticsTracker />
        <CookieBanner />
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          toastOptions={{
            style: {
              background: "#12121a",
              border: "1px solid #1f1f2e",
              color: "#e5e7eb",
            },
          }}
        />
      </body>
    </html>
  );
}
