export {
  buildAnswerSheetPageUrl,
  pageRasterToDataUrl,
  rasterizeDocument,
} from "@/lib/documents/rasterize"
export { rasterizeImage } from "@/lib/documents/rasterize-image"
export { rasterizePdf } from "@/lib/documents/rasterize-pdf"
export { encodePageRaster } from "@/lib/documents/encode-page"
export {
  DEFAULT_MAX_LONG_EDGE,
  DEFAULT_MAX_PAGES,
  DEFAULT_PDF_SCALE,
  DEFAULT_WEBP_QUALITY,
  DocumentRasterizeError,
  type PageRaster,
  type RasterizeOptions,
} from "@/lib/documents/types"
