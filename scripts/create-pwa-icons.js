import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCinemindPng(width, height, isMaskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);  // bit depth
  ihdr.writeUInt8(6, 9);  // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const safeMargin = isMaskable ? Math.floor(width * 0.15) : Math.floor(width * 0.08);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Draw dark Netflix-style base #0B0B0F
      let r = 11, g = 11, b = 15, a = 255;

      // Check if inside inner bounds for logo
      const nx = (x - safeMargin) / (width - 2 * safeMargin);
      const ny = (y - safeMargin) / (height - 2 * safeMargin);

      if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
        // Draw stylized 'C' + cinema slash in electric red (#E50914 to #FF1352)
        const cx = 0.5;
        const cy = 0.5;
        const dx = nx - cx;
        const dy = ny - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Arc for C
        const isArc = dist >= 0.24 && dist <= 0.44 && (dx < 0.15 || Math.abs(dy) > 0.22);
        // Diagonal slash through center
        const isSlash = Math.abs((1 - nx) - ny) < 0.08 && dist < 0.38;

        if (isArc || isSlash) {
          // Electric crimson red gradient
          r = Math.min(255, Math.floor(229 + ny * 26));
          g = Math.floor(9 + nx * 20);
          b = Math.floor(20 + ny * 50);
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

const publicDir = path.resolve('public');

// Create PNG assets
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createCinemindPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createCinemindPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createCinemindPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createCinemindPng(180, 180, false));

// Create SVG Icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="108" fill="#0B0B0F"/>
  <circle cx="256" cy="256" r="160" stroke="url(#paint0_linear)" stroke-width="54" stroke-dasharray="750 250" stroke-linecap="round"/>
  <path d="M140 372L372 140" stroke="url(#paint1_linear)" stroke-width="48" stroke-linecap="round"/>
  <defs>
    <linearGradient id="paint0_linear" x1="96" y1="96" x2="416" y2="416" gradientUnits="userSpaceOnUse">
      <stop stop-color="#E50914"/>
      <stop offset="1" stop-color="#FF1352"/>
    </linearGradient>
    <linearGradient id="paint1_linear" x1="140" y1="372" x2="372" y2="140" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FF1352"/>
      <stop offset="1" stop-color="#E50914"/>
    </linearGradient>
  </defs>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg, 'utf-8');
console.log('PWA PNG & SVG icons created successfully in public/');
