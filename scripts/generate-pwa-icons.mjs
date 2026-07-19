import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const sourceLogo = resolve(rootDir, 'src/assets/The GC Official Logo.png');
const trimmedLogoPath = resolve(rootDir, 'src/assets/tgc-logo-trimmed.png');
const iconsDir = resolve(rootDir, 'public/icons');

const BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };
const VERSION = 'v3';

/** ~10% padding on each side for standard icons (visible logo ~80% of canvas). */
const NORMAL_LOGO_SCALE = 0.8;
/** Maskable safe area — logo stays inside Android launcher masks. */
const MASKABLE_LOGO_SCALE = 0.55;

const STANDARD_SIZES = [48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512];
const MASKABLE_SIZES = [192, 512];

mkdirSync(iconsDir, { recursive: true });

const sourceMeta = await sharp(sourceLogo).metadata();
const trimmed = await sharp(sourceLogo).trim({ threshold: 10 }).png().toBuffer({ resolveWithObject: true });

writeFileSync(trimmedLogoPath, trimmed.data);

const trimmedAspect = trimmed.info.width / trimmed.info.height;

console.log(`Source canvas: ${sourceMeta.width}x${sourceMeta.height}`);
console.log(`Trimmed visible content: ${trimmed.info.width}x${trimmed.info.height}`);
console.log(`Trimmed logo saved to ${trimmedLogoPath}`);

async function renderSquareIcon(size, logoScale, outputName) {
  const logoBox = Math.round(size * logoScale);
  let logoWidth;
  let logoHeight;

  if (trimmedAspect >= 1) {
    logoWidth = logoBox;
    logoHeight = Math.round(logoBox / trimmedAspect);
  } else {
    logoHeight = logoBox;
    logoWidth = Math.round(logoBox * trimmedAspect);
  }

  const logoBuffer = await sharp(trimmed.data)
    .resize(logoWidth, logoHeight, { fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer();

  const left = Math.round((size - logoWidth) / 2);
  const top = Math.round((size - logoHeight) / 2);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: logoBuffer, left, top }])
    .png()
    .toFile(resolve(iconsDir, outputName));
}

await Promise.all([
  ...STANDARD_SIZES.map((size) =>
    renderSquareIcon(size, NORMAL_LOGO_SCALE, `tgc-icon-${VERSION}-${size}.png`),
  ),
  ...MASKABLE_SIZES.map((size) =>
    renderSquareIcon(size, MASKABLE_LOGO_SCALE, `tgc-maskable-${VERSION}-${size}.png`),
  ),
]);

console.log(`Generated TGC PWA icons in public/icons/`);
