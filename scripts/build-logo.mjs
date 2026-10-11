// Lifts the FE monogram off its paper background (reference/logo-original.jpg):
//   src/assets/logo/logo.webp       – the logo in its own colours, transparent background
//   src/assets/logo/logo-mask.webp  – white silhouette with transparency, for tinting
//                                     (wax-seal impression, gold on dark frames)
//   src/assets/logo/favicon.png     – browser tab icon
//   public/images/og-preview.jpg    – 1200×630 WhatsApp link preview
// Run with: npm run logo
import sharp from 'sharp';
const src = 'reference/logo-original.jpg';
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

// Smooth out the paper grain, then measure each pixel's distance from the
// paper colour (median of a border strip).
const { data: smooth } = await sharp(src).median(5).raw().toBuffer({ resolveWithObject: true });
const border = [];
for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) {
  if (x > 80 && x < W - 80 && y > 80 && y < H - 80) continue;
  const i = (y * W + x) * C; border.push([smooth[i], smooth[i + 1], smooth[i + 2]]);
}
const med = (k) => border.map((q) => q[k]).sort((m, n) => m - n)[border.length >> 1];
const paper = [med(0), med(1), med(2)];

const rgba = Buffer.alloc(W * H * 4), mask = Buffer.alloc(W * H * 4);
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (let p = 0; p < W * H; p++) {
  const i = p * C;
  const pp = paper;
  const d = Math.hypot(smooth[i] - pp[0], smooth[i + 1] - pp[1], smooth[i + 2] - pp[2]);
  const a = Math.min(1, Math.max(0, (d - 24) / 46));
  for (let k = 0; k < 3; k++) {
    // un-mix the paper so partially transparent pixels keep the ink colour
    rgba[p * 4 + k] = a > 0 ? Math.min(255, Math.max(0, (data[i + k] - (1 - a) * pp[k]) / a)) : 0;
    mask[p * 4 + k] = 255;
  }
  rgba[p * 4 + 3] = mask[p * 4 + 3] = Math.round(a * 255);
  if (a > 0.6) { const x = p % W, y = (p / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
}
const pad = 12;
const box = { left: Math.max(0, x0 - pad), top: Math.max(0, y0 - pad) };
box.width = Math.min(W, x1 + pad) - box.left; box.height = Math.min(H, y1 + pad) - box.top;
const raw = { raw: { width: W, height: H, channels: 4 } };
await sharp(rgba, raw).extract(box).resize({ width: 640 }).webp({ quality: 88, alphaQuality: 90 }).toFile('src/assets/logo/logo.webp');
await sharp(mask, raw).extract(box).resize({ width: 640 }).webp({ quality: 88, alphaQuality: 90 }).toFile('src/assets/logo/logo-mask.webp');

// Favicon: logo on ivory.
const icon = await sharp(rgba, raw).extract(box).resize(56, 56, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
await sharp({ create: { width: 64, height: 64, channels: 4, background: '#f4ede0' } })
  .composite([{ input: icon, left: 4, top: 4 }]).png().toFile('src/assets/logo/favicon.png');

// Link preview: the cherry-blossom painting on the left, the logo on its paper on the right.
const painting = await sharp('reference/terrace-original.png').extract({ left: 120, top: 420, width: 720, height: 794 })
  .resize(570, 630).toBuffer();
const logoCard = await sharp(src).extract({ left: 160, top: 160, width: 934, height: 934 }).resize(630, 630).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#f4ede0' } })
  .composite([{ input: painting, left: 0, top: 0 }, { input: logoCard, left: 570, top: 0 }])
  .jpeg({ quality: 82, mozjpeg: true }).toFile('public/images/og-preview.jpg');

console.log('paper', paper, 'logo box', box);
