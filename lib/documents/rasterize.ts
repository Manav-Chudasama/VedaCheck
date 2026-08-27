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

/**
 * Rasterize one PDF, one image, or an ordered sequence of page images.
 * Multiple parts must all be images (not PDFs).
 */
export async function rasterizeDocumentParts(
  parts: RasterizeDocumentInput[],
  options?: RasterizeOptions
): Promise<PageRaster[]> {
  if (parts.length === 0) {
    throw new DocumentRasterizeError("No document parts to rasterize")
  }

  if (parts.length === 1) {
    return rasterizeDocument(parts[0]!, options)
  }

  for (const part of parts) {
    if (isPdf(part.mimeType, part.fileName)) {
      throw new DocumentRasterizeError(
        "Multiple PDFs are not supported — upload one PDF or multiple images"
      )
    }
    if (!isImage(part.mimeType, part.fileName)) {
      throw new DocumentRasterizeError(
        `Unsupported document type: ${part.mimeType ?? part.fileName ?? "unknown"}`
      )
    }
  }

  const pages: PageRaster[] = []
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index]!
    const [raster] = await rasterizeImage(part.data, options)
    if (!raster) {
      throw new DocumentRasterizeError(
        `Failed to rasterize image page ${index + 1}`
      )
    }
    pages.push({ ...raster, page: index + 1 })
  }
  return pages
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
