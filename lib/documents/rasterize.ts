import { rasterizeImage } from "@/lib/documents/rasterize-image"
import { rasterizePdf } from "@/lib/documents/rasterize-pdf"
import {
  DocumentRasterizeError,
  type PageRaster,
  type RasterizeOptions,
} from "@/lib/documents/types"

const PDF_MIME = "application/pdf"
const IMAGE_MIME_PREFIX = "image/"

export type RasterizeDocumentInput = {
  data: Buffer | Uint8Array
  mimeType?: string | null
  fileName?: string | null
}

function isPdf(mimeType?: string | null, fileName?: string | null): boolean {
  if (mimeType === PDF_MIME) return true
  if (fileName?.toLowerCase().endsWith(".pdf")) return true
  return false
}

function isImage(mimeType?: string | null, fileName?: string | null): boolean {
  if (mimeType?.startsWith(IMAGE_MIME_PREFIX)) return true
  const name = fileName?.toLowerCase() ?? ""
  return (
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp")
  )
}

/**
 * Rasterize an uploaded PDF or image into page WebP buffers.
 * Preserves per-page pixel dimensions for bbox mapping.
 */
export async function rasterizeDocument(
  input: RasterizeDocumentInput,
  options?: RasterizeOptions
): Promise<PageRaster[]> {
  const { data, mimeType, fileName } = input

  if (isPdf(mimeType, fileName)) {
    return rasterizePdf(data, options)
  }

  if (isImage(mimeType, fileName)) {
    return rasterizeImage(data, options)
  }

  throw new DocumentRasterizeError(
    `Unsupported document type: ${mimeType ?? fileName ?? "unknown"}`
  )
}

export function pageRasterToDataUrl(page: PageRaster): string {
  return `data:${page.mimeType};base64,${page.buffer.toString("base64")}`
}

export function buildAnswerSheetPageUrl(
  assessmentId: string,
  page: number
): string {
  return `/api/assessments/${assessmentId}/pages/${page}`
}
