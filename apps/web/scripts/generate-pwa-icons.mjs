import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "..", "public");
const SVG_PATH = path.join(PUBLIC_DIR, "icon.svg");

function standardSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop stop-color="#818cf8"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
    <radialGradient id="glow" cx="20" cy="20" r="20" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#818cf8" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#0a0a0f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="40" height="40" rx="10" fill="#0a0a0f"/>
  <rect width="40" height="40" rx="10" fill="url(#glow)"/>
  <circle cx="20" cy="20" r="16" stroke="url(#g)" stroke-width="0.6" opacity="0.3" fill="none"/>
  <circle cx="20" cy="20" r="13" stroke="url(#g)" stroke-width="1.2" opacity="0.55" fill="none"/>
  <circle cx="20" cy="20" r="9.5" stroke="url(#g)" stroke-width="0.8" opacity="0.8" fill="none"/>
  <circle cx="20" cy="20" r="7.5" fill="url(#g)"/>
  <path d="M20 20 L32 8" stroke="url(#g)" stroke-width="2" stroke-linecap="round"/>
  <circle cx="32" cy="8" r="1.8" fill="#22d3ee"/>
  <circle cx="32" cy="8" r="3" fill="#22d3ee" opacity="0.3"/>
</svg>`;
}

function maskableSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop stop-color="#818cf8"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
    <radialGradient id="bgGrad" cx="20" cy="20" r="24" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1a1a2e"/>
      <stop offset="1" stop-color="#0a0a0f"/>
    </radialGradient>
  </defs>
  <rect width="40" height="40" fill="url(#bgGrad)"/>
  <circle cx="20" cy="20" r="11" stroke="url(#g)" stroke-width="0.8" opacity="0.35" fill="none"/>
  <circle cx="20" cy="20" r="8" stroke="url(#g)" stroke-width="1.2" opacity="0.7" fill="none"/>
  <circle cx="20" cy="20" r="5.5" fill="url(#g)"/>
  <path d="M20 20 L28 12" stroke="url(#g)" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="28" cy="12" r="1.4" fill="#22d3ee"/>
</svg>`;
}

function appleSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="180" height="180">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
      <stop stop-color="#818cf8"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="40" height="40" rx="8" fill="#0a0a0f"/>
  <circle cx="20" cy="20" r="13" stroke="url(#g)" stroke-width="1.2" opacity="0.55" fill="none"/>
  <circle cx="20" cy="20" r="9" stroke="url(#g)" stroke-width="0.8" opacity="0.8" fill="none"/>
  <circle cx="20" cy="20" r="7" fill="url(#g)"/>
  <path d="M20 20 L32 8" stroke="url(#g)" stroke-width="2" stroke-linecap="round"/>
  <circle cx="32" cy="8" r="1.8" fill="#22d3ee"/>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, svg: standardSvg() },
  { name: "icon-512.png", size: 512, svg: standardSvg() },
  { name: "icon-maskable-192.png", size: 192, svg: maskableSvg() },
  { name: "icon-maskable-512.png", size: 512, svg: maskableSvg() },
  { name: "apple-touch-icon.png", size: 180, svg: appleSvg() },
  { name: "favicon-32.png", size: 32, svg: standardSvg() },
  { name: "favicon-16.png", size: 16, svg: standardSvg() },
];

async function run() {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  for (const t of targets) {
    const buf = Buffer.from(t.svg);
    const out = path.join(PUBLIC_DIR, t.name);
    await sharp(buf, { density: 384 })
      .resize(t.size, t.size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`✓ ${t.name} (${t.size}x${t.size})`);
  }

  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0a0a0f"/>
      <stop offset="0.5" stop-color="#12121a"/>
      <stop offset="1" stop-color="#0a0a0f"/>
    </linearGradient>
    <linearGradient id="acc" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#818cf8"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
    <radialGradient id="glow" cx="600" cy="315" r="500" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#818cf8" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#0a0a0f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(140,120)">
    <circle cx="60" cy="60" r="55" stroke="url(#acc)" stroke-width="2" opacity="0.35" fill="none"/>
    <circle cx="60" cy="60" r="40" stroke="url(#acc)" stroke-width="2" opacity="0.6" fill="none"/>
    <circle cx="60" cy="60" r="24" fill="url(#acc)"/>
    <path d="M60 60 L100 20" stroke="url(#acc)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="100" cy="20" r="6" fill="#22d3ee"/>
  </g>
  <text x="290" y="195" fill="#ffffff" font-family="Inter, sans-serif" font-size="86" font-weight="900" letter-spacing="-2">OtoSonar</text>
  <text x="290" y="260" fill="#94a3b8" font-family="Inter, sans-serif" font-size="32" font-weight="500">AI destekli araç analizi</text>
  <text x="140" y="410" fill="#ffffff" font-family="Inter, sans-serif" font-size="54" font-weight="700" letter-spacing="-1">Saniyeler içinde gizli arızayı</text>
  <text x="140" y="475" fill="url(#acc)" font-family="Inter, sans-serif" font-size="54" font-weight="900" letter-spacing="-1">ve gerçek değeri gör</text>
  <rect x="140" y="520" width="220" height="56" rx="12" fill="url(#acc)"/>
  <text x="250" y="557" fill="#0a0a0f" font-family="Inter, sans-serif" font-size="22" font-weight="800" text-anchor="middle">Hemen Dene →</text>
  <text x="380" y="557" fill="#64748b" font-family="Inter, sans-serif" font-size="18">otosonar.com</text>
</svg>`;
  const ogOut = path.join(PUBLIC_DIR, "og-image.png");
  await sharp(Buffer.from(ogSvg), { density: 150 })
    .png({ compressionLevel: 9 })
    .toFile(ogOut);
  console.log(`✓ og-image.png (1200x630)`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
