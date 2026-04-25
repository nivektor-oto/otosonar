import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { CookieBanner } from "@/components/cookie-banner";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { ErrorReporter } from "@/components/error-reporter";
import { ThirdPartyAnalytics } from "@/components/third-party-analytics";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://otosonar.com"),
  title: "OtoSonar AI | Sahibinden İlan Analizi 8 Saniyede – KM + Hasar + Gerçek Değer 2026",
  description:
    "Sahibinden / arabam.com ilanını yapıştır, 8 saniyede gerçek değer, km oynaması, boya-hasar tespiti ve pazarlık skoru çıksın. Galericiler için kâr işletim sistemi — AI destekli tahmin, 30 gün para iade.",
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
    "sahibinden ilan analizi",
    "arabam.com analiz",
    "araç emsal değer",
    "ikinci el araç analiz",
    "galerici yazılımı",
    "galerici kâr motoru",
    "araç km kontrolü",
    "oto boya değişen tespiti",
    "pazarlık skoru",
    "2 el araç ai",
    "otosonar",
  ],
  authors: [{ name: "NiVector" }],
  openGraph: {
    title: "OtoSonar AI | Sahibinden İlan Analizi 8 Saniyede — 2026",
    description:
      "8 saniyede gerçek değer, km oynaması, boya-hasar, pazarlık skoru. Galericiler için kâr işletim sistemi. AI destekli tahmin.",
    locale: "tr_TR",
    type: "website",
    siteName: "OtoSonar",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "OtoSonar — AI araç analizi" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OtoSonar AI | 8 saniyede araç zekâsı",
    description: "Sahibinden / arabam.com ilanını yapıştır, 8 saniyede gerçek değer çıksın. Galericiler için kâr motoru.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFBFC" },
    { media: "(prefers-color-scheme: dark)", color: "#FAFBFC" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body>
        <style>{`
          @media print {
            [data-nopdf],
            [data-sonner-toaster],
            [data-install-prompt] {
              display: none !important;
            }
          }
        `}</style>
        {children}
        <ServiceWorkerRegister />
        <AnalyticsTracker />
        <ThirdPartyAnalytics />
        <ErrorReporter />
        <CookieBanner />
        <Toaster
          position="top-right"
          theme="light"
          richColors
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#1A1F2E",
            },
          }}
        />
      </body>
    </html>
  );
}
