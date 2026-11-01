// Generates simple, dependency-free PNG app icons (a gift glyph on a
// brand-red rounded background) for the PWA manifest. Pure Node — no
// canvas/sharp/imagemagick dependency, since none is guaranteed available
// wherever this repo is built.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const BRAND = [225, 29, 72]; // #e11d48
const WHITE = [255, 255, 255];
const RIBBON = [22, 163, 74]; // #16a34a

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function roundedSquareMask(x, y, size, radius) {
  // Distance-based rounded-rect test.
  const half = size / 2;
  const dx = Math.max(Math.abs(x - half) - (half - radius), 0);
  const dy = Math.max(Math.abs(y - half) - (half - radius), 0);
  return dx * dx + dy * dy <= radius * radius;
}

function drawIcon(size) {
  const px = new Uint8Array(size * size * 4);
  const set = (x, y, [r, g, b], a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    px[i + 3] = a;
  };
  const rect = (x0, y0, w, h, color) => {
    for (let y = Math.round(y0); y < Math.round(y0 + h); y++) {
      for (let x = Math.round(x0); x < Math.round(x0 + w); x++) set(x, y, color);
    }
  };
  const ellipse = (cx, cy, rx, ry, color) => {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) set(x, y, color);
      }
    }
  };

  // Rounded brand background.
  const radius = size * 0.22;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (roundedSquareMask(x, y, size, radius)) set(x, y, BRAND);
    }
  }

  // Gift box: lid + body, white, with a ribbon cross and a bow.
  const s = size;
  rect(s * 0.24, s * 0.46, s * 0.52, s * 0.32, WHITE); // body
  rect(s * 0.2, s * 0.36, s * 0.6, s * 0.12, WHITE); // lid
  rect(s * 0.2, s * 0.48, s * 0.6, s * 0.025, BRAND); // gap between lid and body
  rect(s * 0.465, s * 0.36, s * 0.07, s * 0.42, RIBBON); // vertical ribbon
  // Bow: two loops above the lid.
  ellipse(s * 0.41, s * 0.31, s * 0.085, s * 0.055, WHITE);
  ellipse(s * 0.59, s * 0.31, s * 0.085, s * 0.055, WHITE);
  ellipse(s * 0.41, s * 0.31, s * 0.04, s * 0.022, BRAND);
  ellipse(s * 0.59, s * 0.31, s * 0.04, s * 0.022, BRAND);
  ellipse(s * 0.5, s * 0.33, s * 0.04, s * 0.035, RIBBON);

  return px;
}

function encodePNG(size) {
  const px = drawIcon(size);
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    Buffer.from(px.buffer, y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = deflateSync(raw);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([signature, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

mkdirSync("public/icons", { recursive: true });
for (const size of [192, 512]) {
  writeFileSync(`public/icons/icon-${size}.png`, encodePNG(size));
  console.log(`wrote public/icons/icon-${size}.png`);
}
