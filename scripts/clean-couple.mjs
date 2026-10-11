// One-off: removes the image generator's sparkle mark from the couple illustration
// by diffusing the surrounding colours into it, then exports it for the arch.
import sharp from 'sharp';
const src = 'reference/couple-original.jpg';
const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const cx = 723, cy = 1144, R = 36;
const mask = new Uint8Array(W * H);
for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) {
  if ((x - cx) ** 2 + (y - cy) ** 2 > R * R) continue;
  const i = (y * W + x) * C, r = data[i], g = data[i + 1], b = data[i + 2];
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
  const inStar = dx ** (2 / 3) + dy ** (2 / 3) <= 27 ** (2 / 3); // four-point star (astroid)
  if (inStar || (max > 150 && max - min < 45)) mask[y * W + x] = 1;
}
// dilate 3px to catch the anti-aliased edge
for (let k = 0; k < 3; k++) {
  const m2 = mask.slice();
  for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++)
    if (mask[y * W + x] || mask[y * W + x - 1] || mask[y * W + x + 1] || mask[(y - 1) * W + x] || mask[(y + 1) * W + x]) m2[y * W + x] = 1;
  mask.set(m2);
}
let n = 0; for (const v of mask) n += v;
// diffusion inpaint
for (let it = 0; it < 400; it++) {
  for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) {
    if (!mask[y * W + x]) continue;
    for (let c = 0; c < 3; c++) {
      const v = (data[(y * W + x - 1) * C + c] + data[(y * W + x + 1) * C + c] + data[((y - 1) * W + x) * C + c] + data[((y + 1) * W + x) * C + c]) / 4;
      data[(y * W + x) * C + c] = v;
    }
  }
}
await sharp(data, { raw: info }).webp({ quality: 82 }).toFile('src/assets/scenes/couple.webp');
console.log('masked px', n);
