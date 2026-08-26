/** Page raster produced by the document pipeline (server-only). */

export type PageRaster = {
  /** 1-based page index */
  page: number
  /** Encoded image bytes (typically WebP) */
  buffer: Buffer
  mimeType: "image/webp" | "image/png" | "image/jpeg"
  width: number
  height: number
}

export type RasterizeOptions = {
  /** Max pages to rasterize (assignment-friendly default). */
  maxPages?: number
  /** PDF render scale (1 = 72dpi CSS px). Higher = sharper OCR/UI. */
  pdfScale?: number
  /** Max long-edge pixels for images / PDF pages after render. */
  maxLongEdge?: number
  /** WebP quality 1–100 */
  webpQuality?: number
}

export const DEFAULT_MAX_PAGES = 20
export const DEFAULT_PDF_SCALE = 2
export const DEFAULT_MAX_LONG_EDGE = 2000
export const DEFAULT_WEBP_QUALITY = 82

export class DocumentRasterizeError extends Error {
  readonly code = "DOCUMENT_RASTERIZE" as const

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = "DocumentRasterizeError"
  }
}
