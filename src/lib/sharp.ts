import sharp from "sharp";

export async function convertToWebP(
  fileBuffer: Buffer,
  options?: {
    quality?: number;
    maxSizeBytes?: number;
    maxDimension?: number;
  },
): Promise<Buffer> {
  const {
    quality = 80,
    maxSizeBytes = 1024 * 1024,
    maxDimension = 1920,
  } = options || {};

  const dims = [maxDimension, 1600, 1200, 800];
  let result: Buffer = Buffer.alloc(0);

  outer: for (const dim of dims) {
    for (let q = quality; q >= 10; q -= 10) {
      result = await sharp(fileBuffer)
        .resize(dim, dim, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: q })
        .toBuffer();
      if (result.length <= maxSizeBytes) break outer;
    }
  }

  return result;
}
