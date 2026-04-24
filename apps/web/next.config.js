const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  // Monorepo root — pnpm symlink'lerini izle
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
};

module.exports = nextConfig;
