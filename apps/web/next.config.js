const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  // iyzipay, lib/Iyzipay.js'te __dirname + "/resources" ile dinamik require ediyor.
  // Webpack bundle'larsa __dirname değişir, resources bulunamaz. Bundle disi tut.
  serverExternalPackages: ["iyzipay"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  outputFileTracingIncludes: {
    "/api/checkout": [
      "../../node_modules/.pnpm/iyzipay@*/node_modules/iyzipay/**/*",
    ],
    "/api/iyzico-webhook": [
      "../../node_modules/.pnpm/iyzipay@*/node_modules/iyzipay/**/*",
    ],
    "/odeme/callback": [
      "../../node_modules/.pnpm/iyzipay@*/node_modules/iyzipay/**/*",
    ],
  },
  async redirects() {
    return [
      { source: "/fiyatlandirma", destination: "/fiyatlar", permanent: true },
      { source: "/kullanim-sartlari", destination: "/sozlesme", permanent: true },
      { source: "/kullanim-kosullari", destination: "/sozlesme", permanent: true },
      { source: "/kvkk-aydinlatma", destination: "/kvkk", permanent: true },
      { source: "/cerez-politikasi", destination: "/cerez", permanent: true },
      { source: "/gizlilik-politikasi", destination: "/gizlilik", permanent: true },
    ];
  },
};

module.exports = nextConfig;
