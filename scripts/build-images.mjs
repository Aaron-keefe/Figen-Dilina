// Derives web images from the reference artwork.
// Run with: npm run images
import sharp from 'sharp';
const src = 'reference/original-card.jpg';

// Closing frame background: the forested far shore and lake from the cherry-blossom painting.
await sharp('reference/terrace-original.png').extract({ left: 400, top: 880, width: 541, height: 780 })
  .webp({ quality: 88 }).toFile('src/assets/scenes/forest.webp');

console.log('images written to src/assets/scenes');
