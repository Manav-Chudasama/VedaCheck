import type { AiImagePart } from "@/lib/ai/types"
import type { PageRaster } from "@/lib/documents/types"

/** Convert page rasters into vision image parts (preserves page order). */
export function pageRastersToAiImages(pages: PageRaster[]): AiImagePart[] {
  return [...pages]
    .sort((a, b) => a.page - b.page)
    .map((page) => ({
      mimeType: page.mimeType,
      data: page.buffer,
    }))
}
