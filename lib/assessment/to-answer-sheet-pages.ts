import { buildAnswerSheetPageUrl } from "@/lib/documents/rasterize"
import type { PageRaster } from "@/lib/documents/types"
import type { AnswerSheetPage } from "@/lib/assessment/types"

/** Map stored answer-sheet rasters into viewer page descriptors. */
export function toAnswerSheetPages(
  assessmentId: string,
  rasters: PageRaster[]
): AnswerSheetPage[] {
  return rasters.map((raster) => ({
    page: raster.page,
    label: `Page ${raster.page}`,
    imageUrl: buildAnswerSheetPageUrl(assessmentId, raster.page),
    width: raster.width,
    height: raster.height,
  }))
}
