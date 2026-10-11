// Generates PLACEHOLDER scene backdrops (9:16) until the real artwork arrives.
// Crops come from the card painting; the church and gazebo are simple painted-light
// gradients. Replace the files in src/assets/scenes/ with the final images
// (same names, or update src/config.js). Run with: npm run placeholders
import sharp from 'sharp';
import fs from 'node:fs';

const src = 'reference/original-card.jpg';
const dir = 'src/assets/scenes';
fs.mkdirSync(dir, { recursive: true });
const W = 720, H = 1280;

async function crop(name, region, { blur = 0.6, modulate = {} } = {}) {
  await sharp(src).extract(region).resize(W, H, { fit: 'cover' })
    .blur(blur).modulate({ saturation: 0.9, ...modulate })
    .webp({ quality: 70 }).toFile(`${dir}/${name}.webp`);
}

function svg(body) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}</svg>`);
}






// Mist overlay (real asset, not a placeholder): a tall band of soft cloud,
// feathered at both ends and solid in the middle, used for mist transitions.
const MH = 2600;
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${MH}">
  <defs>
    <filter id="m" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".005 .011" numOctaves="4" seed="7"/>
      <feColorMatrix values="0 0 0 0 1  0 0 0 0 .985  0 0 0 0 .955  0 0 0 2.2 -.6"/>
    </filter>
    <linearGradient id="solid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/>
      <stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="core" x1="0" y1="0" x2="0" y2="1">
      <stop offset=".18" stop-color="#fff" stop-opacity="0"/><stop offset=".32" stop-color="#fff"/>
      <stop offset=".68" stop-color="#fff"/><stop offset=".82" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="k"><rect width="100%" height="100%" fill="url(#solid)"/></mask>
    <mask id="c"><rect width="100%" height="100%" fill="url(#core)"/></mask>
  </defs>
  <g mask="url(#k)"><rect width="100%" height="100%" filter="url(#m)"/></g>
  <rect width="100%" height="100%" fill="#f4ede0" mask="url(#c)"/>
</svg>`)).webp({ quality: 72, alphaQuality: 80 }).toFile(`${dir}/mist.webp`);

console.log('placeholders written to', dir);
