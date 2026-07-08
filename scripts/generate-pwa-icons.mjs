import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const publicDir = resolve(process.cwd(), 'public');
const sourceSvg = readFileSync(resolve(publicDir, 'pwa-icon.svg'));

const targets = [
  { fileName: 'pwa-192x192.png', size: 192 },
  { fileName: 'pwa-512x512.png', size: 512 },
  { fileName: 'apple-touch-icon.png', size: 180 },
];

await Promise.all(
  targets.map(({ fileName, size }) =>
    sharp(sourceSvg)
      .resize(size, size)
      .png()
      .toFile(resolve(publicDir, fileName)),
  ),
);

console.log('Generated PWA icons in public/');
