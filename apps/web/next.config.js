/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  outputFileTracingIncludes: {
    "/api/checkout": ["./node_modules/iyzipay/**/*"],
    "/api/iyzico-webhook": ["./node_modules/iyzipay/**/*"],
    "/odeme/callback": ["./node_modules/iyzipay/**/*"],
  },
};

module.exports = nextConfig;
