import {
  DEFAULT_MAX_LONG_EDGE,
  DEFAULT_WEBP_QUALITY,
  DocumentRasterizeError,
  type PageRaster,
  type RasterizeOptions,
} from "@/lib/documents/types"
import { encodePageRaster } from "@/lib/documents/encode-page"

/**
 * Normalize a single uploaded image into one PageRaster (page 1).
 * Applies EXIF orientation and optional long-edge downscale via sharp.
 */
export async function rasterizeImage(
  data: Buffer | Uint8Array,
  options: RasterizeOptions = {}
): Promise<PageRaster[]> {
  const maxLongEdge = options.maxLongEdge ?? DEFAULT_MAX_LONG_EDGE
  const webpQuality = options.webpQuality ?? DEFAULT_WEBP_QUALITY

  try {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
    const page = await encodePageRaster(buffer, 1, {
      maxLongEdge,
      webpQuality,
    })
    return [page]
  } catch (error) {
    if (error instanceof DocumentRasterizeError) throw error
    throw new DocumentRasterizeError("Failed to rasterize image", {
      cause: error,
    })
  }
}
