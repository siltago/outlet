// Gera placeholders PNG sólidos localmente (sem dependências externas) para
// public/images/products, até que fotografias reais dos produtos sejam enviadas.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
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

// Gera um PNG RGBA sólido com uma leve faixa diagonal e um "X" central discreto,
// só para diferenciar visualmente as categorias sem parecer imagem quebrada.
function makePlaceholder({ width, height, bg, accent }) {
  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filtro: none
    for (let x = 0; x < width; x++) {
      const diag = Math.abs((x - y) % 160) < 3 || Math.abs((x + y - width) % 160) < 3;
      const [r, g, b] = diag ? accent : bg;
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw, { level: 9 });
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return png;
}

const outDir = path.join(__dirname, "..", "public", "images", "products");
fs.mkdirSync(outDir, { recursive: true });

const BG = [235, 235, 235]; // cinza claro
const ACCENT = [227, 6, 19]; // vermelho da marca

const categorias = [
  "smartphones",
  "relogios",
  "fones",
  "perfumes",
  "tenis",
  "acessorios",
];

for (const cat of categorias) {
  const png = makePlaceholder({ width: 900, height: 900, bg: BG, accent: ACCENT });
  fs.writeFileSync(path.join(outDir, `placeholder-${cat}.png`), png);
  console.log(`gerado: placeholder-${cat}.png`);
}

// fallback genérico
const generic = makePlaceholder({ width: 900, height: 900, bg: BG, accent: [20, 20, 20] });
fs.writeFileSync(path.join(outDir, "placeholder-produto.png"), generic);
console.log("gerado: placeholder-produto.png");
