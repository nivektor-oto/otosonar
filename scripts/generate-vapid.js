// One-time VAPID key generator for web-push.
// Run with: node scripts/generate-vapid.js
// Copy the output into Vercel env as VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY.
/* eslint-disable @typescript-eslint/no-require-imports */
const webpush = require("web-push");

const keys = webpush.generateVAPIDKeys();

console.log("VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
console.log("VAPID_SUBJECT=mailto:kurucu@otosonar.com");
console.log("");
console.log("Bu anahtarları .env.local'e ve Vercel'de production env'e ekle.");
