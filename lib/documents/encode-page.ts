import sharp from "sharp"

import {
  DEFAULT_MAX_LONG_EDGE,
  DEFAULT_WEBP_QUALITY,
  DocumentRasterizeError,
  type PageRaster,
} from "@/lib/documents/types"

type EncodeOptions = {
  maxLongEdge?: number
  webpQuality?: number
}

/**
 * Normalize any raster buffer to WebP, apply EXIF orientation, optionally
 * downscale long edge. Returns buffer + final pixel dimensions.
 */
export async function encodePageRaster(
  input: Buffer,
  page: number,
  options: EncodeOptions = {}
): Promise<PageRaster> {
  const maxLongEdge = options.maxLongEdge ?? DEFAULT_MAX_LONG_EDGE
  const webpQuality = options.webpQuality ?? DEFAULT_WEBP_QUALITY

  try {
    let pipeline = sharp(input, { failOn: "none" }).rotate()

    const meta = await pipeline.metadata()
    const width = meta.width ?? 0
    const height = meta.height ?? 0
    if (width <= 0 || height <= 0) {
      throw new DocumentRasterizeError("Image has invalid dimensions")
    }

    const longEdge = Math.max(width, height)
    if (longEdge > maxLongEdge) {
      pipeline = pipeline.resize({
        width: width >= height ? maxLongEdge : undefined,
        height: height > width ? maxLongEdge : undefined,
        fit: "inside",
        withoutEnlargement: true,
      })
    }

    const { data, info } = await pipeline
      .webp({ quality: webpQuality })
      .toBuffer({ resolveWithObject: true })

    return {
      page,
      buffer: data,
      mimeType: "image/webp",
      width: info.width,
      height: info.height,
    }
  } catch (error) {
    if (error instanceof DocumentRasterizeError) throw error
    throw new DocumentRasterizeError("Failed to encode page image", {
      cause: error,
    })
  }
}
