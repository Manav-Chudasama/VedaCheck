import type { GeminiImagePart } from "@/lib/ai/types"
import type { PageRaster } from "@/lib/documents/types"

/** Convert page rasters into Gemini inline image parts (preserves page order). */
export function pageRastersToGeminiImages(
  pages: PageRaster[]
): GeminiImagePart[] {
  return [...pages]
    .sort((a, b) => a.page - b.page)
    .map((page) => ({
      mimeType: page.mimeType,
      data: page.buffer,
    }))
}
