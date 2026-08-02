import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';

const rootDir = process.cwd();
const targetArtifactDir = path.join(rootDir, 'artifacts', 'phase1a-i18n-pier-cards');

function parsePng(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47 || buffer.readUInt32BE(4) !== 0x0d0a1a0a) {
    throw new Error('Not a PNG file');
  }

  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idatChunks = [];
  let palette = null;

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'PLTE') {
      palette = data;
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  const compressed = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  let bytesPerPixel = 3;
  if (colorType === 6) bytesPerPixel = 4;
  else if (colorType === 0 || colorType === 3) bytesPerPixel = 1;

  const stride = width * bytesPerPixel;
  const rawPixels = Buffer.alloc(width * height * 3);

  let srcOffset = 0;
  const prevLine = Buffer.alloc(stride);
  const currentLine = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = decompressed[srcOffset++];
    const lineData = decompressed.subarray(srcOffset, srcOffset + stride);
    srcOffset += stride;

    for (let i = 0; i < stride; i++) {
      const x = lineData[i];
      const a = i >= bytesPerPixel ? currentLine[i - bytesPerPixel] : 0;
      const b = prevLine[i];
      const c = i >= bytesPerPixel ? prevLine[i - bytesPerPixel] : 0;

      let val = 0;
      if (filter === 0) val = x;
      else if (filter === 1) val = (x + a) & 0xff;
      else if (filter === 2) val = (x + b) & 0xff;
      else if (filter === 3) val = (x + Math.floor((a + b) / 2)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = c;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        val = (x + pr) & 0xff;
      }
      currentLine[i] = val;
    }

    for (let px = 0; px < width; px++) {
      const outIdx = (y * width + px) * 3;
      if (colorType === 2 || colorType === 6) {
        rawPixels[outIdx] = currentLine[px * bytesPerPixel];
        rawPixels[outIdx + 1] = currentLine[px * bytesPerPixel + 1];
        rawPixels[outIdx + 2] = currentLine[px * bytesPerPixel + 2];
      } else if (colorType === 3 && palette) {
        const idx = currentLine[px];
        rawPixels[outIdx] = palette[idx * 3];
        rawPixels[outIdx + 1] = palette[idx * 3 + 1];
        rawPixels[outIdx + 2] = palette[idx * 3 + 2];
      } else {
        const g = currentLine[px];
        rawPixels[outIdx] = g;
        rawPixels[outIdx + 1] = g;
        rawPixels[outIdx + 2] = g;
      }
    }

    currentLine.copy(prevLine);
  }

  const totalPixels = width * height;
  const colorMap = new Map();
  let dominantColorHex = '#000000';
  let maxCount = 0;

  for (let i = 0; i < totalPixels; i++) {
    const r = rawPixels[i * 3];
    const g = rawPixels[i * 3 + 1];
    const b = rawPixels[i * 3 + 2];
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    const count = (colorMap.get(hex) || 0) + 1;
    colorMap.set(hex, count);
    if (count > maxCount) {
      maxCount = count;
      dominantColorHex = hex;
    }
  }

  return {
    width,
    height,
    uniqueColorCount: colorMap.size,
    dominantColorHex,
    dominantRatio: totalPixels > 0 ? maxCount / totalPixels : 0
  };
}

async function createForensicArchive() {
  const timestampUtc = new Date().toISOString().replace(/[:.]/g, '-');
  const forensicDir = path.join(targetArtifactDir, 'forensic-failures', timestampUtc);
  fs.mkdirSync(forensicDir, { recursive: true });

  const targetFiles = [
    'cdp-state-diagnosis.json',
    'cdp-state-diagnosis.md',
    'diagnostic-zhTW-asakusa-card.png',
    'diagnostic-failure-state.png',
    'desktop-zhTW-asakusa-card.png',
    'desktop-en-hinode-card.png',
    'desktop-ja-hamarikyu-card.png',
    'desktop-ko-odaiba-card.png',
    'mobile-360-language-picker.png',
    'mobile-390-pier-card.png',
    'secondary-review-entry-regression.png'
  ];

  const manifestEntries = [];

  for (const filename of targetFiles) {
    const sourcePath = path.join(targetArtifactDir, filename);
    if (!fs.existsSync(sourcePath)) {
      console.log(`Skipping missing target file: ${filename}`);
      continue;
    }

    const destPath = path.join(forensicDir, filename);
    fs.copyFileSync(sourcePath, destPath);

    const buffer = fs.readFileSync(sourcePath);
    const sizeBytes = buffer.length;
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');

    let imgMetrics = null;
    if (filename.endsWith('.png')) {
      try {
        imgMetrics = parsePng(buffer);
      } catch (e) {
        console.error(`Failed to parse PNG ${filename}:`, e.message);
      }
    }

    manifestEntries.push({
      fileName: filename,
      sourcePath: path.relative(rootDir, sourcePath).replace(/\\/g, '/'),
      forensicCopyPath: path.relative(rootDir, destPath).replace(/\\/g, '/'),
      sizeBytes,
      sha256,
      imageMetrics: imgMetrics
    });
  }

  const manifest = {
    timestampUtc: new Date().toISOString(),
    forensicDirectory: path.relative(rootDir, forensicDir).replace(/\\/g, '/'),
    statement: "These preserved files represent failed/unverified evidence collected prior to truth-logic repair. They are retained as immutable forensic reference and DO NOT constitute valid Phase 1A evidence or screenshots.",
    files: manifestEntries
  };

  const manifestPath = path.join(forensicDir, 'forensic-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`✅ Forensic failure archive created at: ${forensicDir}`);
  console.log(`Recorded ${manifestEntries.length} failed files in forensic-manifest.json`);
  return { forensicDir, manifestPath, manifest };
}

createForensicArchive().catch(err => {
  console.error('Forensic archive creation failed:', err);
  process.exit(1);
});
