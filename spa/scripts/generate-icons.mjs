import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// forest theme: background #1d232a, primary #1eb854, text white
function buildSvg(size) {
  const radius = size * 0.18;
  const fontSize = size * 0.38;
  const letterSpacing = size * -0.02;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#1d232a"/>
  <text
    x="50%"
    y="54%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="'Segoe UI', Arial, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    letter-spacing="${letterSpacing}"
    fill="#1eb854"
  >MS</text>
</svg>`;
}

for (const size of sizes) {
  const svg = Buffer.from(buildSvg(size));
  const outPath = join(iconsDir, `icon-${size}x${size}.png`);
  await sharp(svg).png().toFile(outPath);
  console.log(`✓ ${outPath}`);
}

// Also generate favicon.ico (32x32 PNG used as favicon)
const faviconSvg = Buffer.from(buildSvg(32));
const faviconPath = join(__dirname, '..', 'public', 'favicon.ico');
await sharp(faviconSvg).png().toFile(faviconPath);
console.log(`✓ favicon.ico`);

console.log('\nAll icons generated successfully.');
