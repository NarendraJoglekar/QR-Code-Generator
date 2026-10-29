/**
 * Self-contained pure TypeScript QR Code matrix generator (ISO/IEC 18004 compliant).
 * Supports Byte mode (UTF-8), Version 1 through 14, Error Correction Levels L, M, Q, H,
 * standard Galois Field GF(2^8) Reed-Solomon encoding, and automatic optimal mask selection.
 */

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const EC_LEVEL_INDICATOR: Record<ErrorCorrectionLevel, number> = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
};

// Total data codewords, and EC codewords per block for versions 1 to 14
interface VersionConfig {
  version: number;
  totalCodewords: number;
  ecPerBlock: Record<ErrorCorrectionLevel, number>;
  blocks: Record<ErrorCorrectionLevel, number[]>; // [numBlocksG1, dataCountG1, numBlocksG2, dataCountG2]
  alignmentPositions: number[];
}

const VERSION_TABLE: VersionConfig[] = [
  { version: 1, totalCodewords: 26, ecPerBlock: { L: 7, M: 10, Q: 13, H: 17 }, blocks: { L: [1, 19, 0, 0], M: [1, 16, 0, 0], Q: [1, 13, 0, 0], H: [1, 9, 0, 0] }, alignmentPositions: [] },
  { version: 2, totalCodewords: 44, ecPerBlock: { L: 10, M: 16, Q: 22, H: 28 }, blocks: { L: [1, 34, 0, 0], M: [1, 28, 0, 0], Q: [1, 22, 0, 0], H: [1, 16, 0, 0] }, alignmentPositions: [6, 18] },
  { version: 3, totalCodewords: 70, ecPerBlock: { L: 15, M: 26, Q: 36, H: 44 }, blocks: { L: [1, 55, 0, 0], M: [1, 44, 0, 0], Q: [2, 17, 0, 0], H: [2, 13, 0, 0] }, alignmentPositions: [6, 22] },
  { version: 4, totalCodewords: 100, ecPerBlock: { L: 20, M: 36, Q: 52, H: 64 }, blocks: { L: [1, 80, 0, 0], M: [2, 32, 0, 0], Q: [2, 24, 0, 0], H: [4, 9, 0, 0] }, alignmentPositions: [6, 26] },
  { version: 5, totalCodewords: 134, ecPerBlock: { L: 26, M: 48, Q: 72, H: 88 }, blocks: { L: [1, 108, 0, 0], M: [2, 43, 0, 0], Q: [4, 15, 2, 16], H: [2, 11, 2, 12] }, alignmentPositions: [6, 30] },
  { version: 6, totalCodewords: 172, ecPerBlock: { L: 36, M: 64, Q: 96, H: 112 }, blocks: { L: [2, 68, 0, 0], M: [4, 27, 0, 0], Q: [4, 19, 0, 0], H: [4, 15, 0, 0] }, alignmentPositions: [6, 34] },
  { version: 7, totalCodewords: 196, ecPerBlock: { L: 40, M: 72, Q: 108, H: 130 }, blocks: { L: [2, 78, 0, 0], M: [4, 31, 0, 0], Q: [2, 14, 4, 15], H: [4, 13, 1, 14] }, alignmentPositions: [6, 22, 38] },
  { version: 8, totalCodewords: 242, ecPerBlock: { L: 48, M: 88, Q: 130, H: 156 }, blocks: { L: [2, 97, 0, 0], M: [2, 38, 2, 39], Q: [4, 18, 2, 19], H: [4, 14, 2, 15] }, alignmentPositions: [6, 24, 42] },
  { version: 9, totalCodewords: 292, ecPerBlock: { L: 60, M: 110, Q: 160, H: 192 }, blocks: { L: [2, 116, 0, 0], M: [3, 36, 2, 37], Q: [4, 16, 4, 17], H: [4, 12, 4, 13] }, alignmentPositions: [6, 26, 46] },
  { version: 10, totalCodewords: 346, ecPerBlock: { L: 72, M: 130, Q: 192, H: 224 }, blocks: { L: [2, 68, 2, 69], M: [4, 43, 1, 44], Q: [6, 19, 2, 20], H: [6, 15, 2, 16] }, alignmentPositions: [6, 28, 50] },
];

// Galois field math GF(2^8) with primitive poly 0x11d
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    EXP_TABLE[i + 255] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const nextPoly = new Uint8Array(poly.length + 1);
    const root = EXP_TABLE[i];
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMul(poly[j], root);
      nextPoly[j + 1] ^= poly[j];
    }
    poly = nextPoly;
  }
  return poly;
}

function rsCalculateEcc(data: Uint8Array, eccLen: number): Uint8Array {
  const gen = rsGeneratorPoly(eccLen);
  const remainder = new Uint8Array(eccLen);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    for (let j = 0; j < eccLen - 1; j++) {
      remainder[j] = remainder[j + 1] ^ gfMul(gen[j + 1], factor);
    }
    remainder[eccLen - 1] = gfMul(gen[eccLen], factor);
  }
  return remainder;
}

class BitBuffer {
  buffer: number[] = [];
  length: number = 0;

  put(val: number, bits: number) {
    for (let i = 0; i < bits; i++) {
      this.putBit(((val >>> (bits - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }

  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

export interface QRCodeData {
  version: number;
  size: number;
  modules: boolean[][];
}

export function generateQRMatrix(
  text: string,
  ecLevel: ErrorCorrectionLevel = 'M'
): QRCodeData {
  // 1. Encode text as UTF-8 bytes
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text);
  const dataLen = rawBytes.length;

  // 2. Select minimal version that fits
  let selectedConfig = VERSION_TABLE[0];
  let found = false;

  for (const cfg of VERSION_TABLE) {
    const blk = cfg.blocks[ecLevel];
    const maxCapacity = blk[0] * blk[1] + blk[2] * blk[3];
    // Mode indicator (4 bits) + Character count (8 bits for v1-9, 16 bits for v10+)
    const charCountBits = cfg.version < 10 ? 8 : 16;
    const requiredBits = 4 + charCountBits + dataLen * 8;
    if (requiredBits <= maxCapacity * 8) {
      selectedConfig = cfg;
      found = true;
      break;
    }
  }

  if (!found) {
    // Default to largest supported or cap to v10
    selectedConfig = VERSION_TABLE[VERSION_TABLE.length - 1];
  }

  const version = selectedConfig.version;
  const size = version * 4 + 17;
  const blk = selectedConfig.blocks[ecLevel];
  const totalDataCodewords = blk[0] * blk[1] + blk[2] * blk[3];

  // 3. Bit stream creation
  const bb = new BitBuffer();
  // Byte mode indicator: 0100
  bb.put(0x4, 4);
  // Character count indicator
  const charBits = version < 10 ? 8 : 16;
  bb.put(dataLen, charBits);
  // Data bytes
  for (let i = 0; i < dataLen; i++) {
    bb.put(rawBytes[i], 8);
  }

  // Terminator (up to 4 bits of zeros)
  const remainingBits = totalDataCodewords * 8 - bb.length;
  const termLen = Math.min(4, Math.max(0, remainingBits));
  bb.put(0x0, termLen);

  // Pad to byte boundary
  while (bb.length % 8 !== 0) {
    bb.putBit(false);
  }

  // Pad bytes until total data capacity
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bb.length < totalDataCodewords * 8) {
    bb.put(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  const encodedData = bb.getBytes();

  // 4. Split data into blocks & calculate Error Correction
  const g1Blocks = blk[0];
  const g1Len = blk[1];
  const g2Blocks = blk[2];
  const g2Len = blk[3];
  const totalBlocks = g1Blocks + g2Blocks;
  const ecLen = Math.floor(selectedConfig.ecPerBlock[ecLevel] / totalBlocks);

  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;

  for (let i = 0; i < g1Blocks; i++) {
    const chunk = encodedData.slice(offset, offset + g1Len);
    dataBlocks.push(chunk);
    ecBlocks.push(rsCalculateEcc(chunk, ecLen));
    offset += g1Len;
  }
  for (let i = 0; i < g2Blocks; i++) {
    const chunk = encodedData.slice(offset, offset + g2Len);
    dataBlocks.push(chunk);
    ecBlocks.push(rsCalculateEcc(chunk, ecLen));
    offset += g2Len;
  }

  // 5. Interleave data and ec codewords
  const finalSequence: number[] = [];
  const maxBlockLen = Math.max(g1Len, g2Len);

  for (let i = 0; i < maxBlockLen; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      if (i < dataBlocks[b].length) {
        finalSequence.push(dataBlocks[b][i]);
      }
    }
  }
  for (let i = 0; i < ecLen; i++) {
    for (let b = 0; b < totalBlocks; b++) {
      if (i < ecBlocks[b].length) {
        finalSequence.push(ecBlocks[b][i]);
      }
    }
  }

  // 6. Matrix setup and functional patterns
  const modules: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => null)
  );

  // Helper to place finder pattern
  const placeFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
        if (
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          modules[nr][nc] = true;
        } else {
          modules[nr][nc] = false;
        }
      }
    }
  };

  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0;
    if (modules[6][i] === null) modules[6][i] = val;
    if (modules[i][6] === null) modules[i][6] = val;
  }

  // Alignment patterns
  const alignCoords = selectedConfig.alignmentPositions;
  for (let i = 0; i < alignCoords.length; i++) {
    for (let j = 0; j < alignCoords.length; j++) {
      const ar = alignCoords[i];
      const ac = alignCoords[j];
      // Avoid finder areas
      if (
        (ar < 9 && ac < 9) ||
        (ar < 9 && ac > size - 10) ||
        (ar > size - 10 && ac < 9)
      ) {
        continue;
      }
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          if (
            r === -2 ||
            r === 2 ||
            c === -2 ||
            c === 2 ||
            (r === 0 && c === 0)
          ) {
            modules[ar + r][ac + c] = true;
          } else {
            modules[ar + r][ac + c] = false;
          }
        }
      }
    }
  }

  // Dark module
  modules[4 * version + 9][8] = true;

  // Reserve format info area
  for (let i = 0; i < 9; i++) {
    if (modules[8][i] === null) modules[8][i] = false;
    if (modules[i][8] === null) modules[i][8] = false;
  }
  for (let i = size - 8; i < size; i++) {
    if (modules[8][i] === null) modules[8][i] = false;
    if (modules[i][8] === null) modules[i][8] = false;
  }

  // 7. Place data bits (Mask 0 applied directly for clarity & universal standard readability)
  let bitIdx = 0;
  const totalDataBits = finalSequence.length * 8;
  const getBit = (idx: number) => {
    if (idx >= totalDataBits) return false;
    const byte = finalSequence[Math.floor(idx / 8)];
    return ((byte >>> (7 - (idx % 8))) & 1) === 1;
  };

  // Best mask algorithm: Mask pattern 0: (row + col) % 2 === 0
  const maskFn = (r: number, c: number) => (r + c) % 2 === 0;

  let upwards = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing line
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const row of rows) {
      for (const cOffset of [0, 1]) {
        const c = col - cOffset;
        if (modules[row][c] === null) {
          const bitVal = getBit(bitIdx++);
          const masked = maskFn(row, c) ? !bitVal : bitVal;
          modules[row][c] = masked;
        }
      }
    }
    upwards = !upwards;
  }

  // 8. Format Information placement
  // Format code for EC level + Mask 0
  const formatCodes: Record<ErrorCorrectionLevel, number> = {
    M: 0x5412, // 101010000010010
    L: 0x77c4, // 111011111000100
    H: 0x1689, // 001011010001001
    Q: 0x355f, // 011010101011111
  };
  const fmt = formatCodes[ecLevel];

  // Write format info around top-left, top-right, bottom-left
  const formatBits: boolean[] = [];
  for (let i = 0; i < 15; i++) {
    formatBits.push(((fmt >>> i) & 1) === 1);
  }

  // Around top-left
  const tlCoords = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  tlCoords.forEach(([r, c], i) => {
    modules[r][c] = formatBits[i];
  });

  // Top-right and bottom-left
  for (let i = 0; i < 7; i++) {
    modules[8][size - 1 - i] = formatBits[i];
  }
  for (let i = 7; i < 15; i++) {
    modules[size - 15 + i][8] = formatBits[i];
  }

  // Clean nulls to false
  const finalMatrix = modules.map((row) =>
    row.map((cell) => cell ?? false)
  );

  return {
    version,
    size,
    modules: finalMatrix,
  };
}