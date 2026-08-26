import type { AnswerRegion } from "@/lib/assessment/types"

export type BBox = [number, number, number, number]

export type PageSize = {
  width: number
  height: number
}

export type BBoxValidationResult =
  | { ok: true; bbox: BBox }
  | { ok: false; reason: string }

const EPSILON = 1e-6

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Detect whether a raw bbox is already 0–1, 0–1000, or pixel-based,
 * then convert to normalized 0–1 coordinates.
 *
 * Heuristic (prompt asks for 0–1; models often return 0–1000 or pixels):
 * 1. max ≤ 1 → already normalized
 * 2. with page size:
 *    - max > 1000 → pixels
 *    - fits in page and page long-edge ≤ 1000 → pixels (small scans)
 *    - otherwise if max ≤ 1000 → 0–1000 space
 * 3. without page, max ≤ 1000 → 0–1000 space
 */
export function toNormalizedBbox(
  raw: BBox,
  page?: PageSize
): BBox | null {
  if (!raw.every((n) => Number.isFinite(n))) return null

  let [x1, y1, x2, y2] = raw

  // Ensure ordering before scale detection.
  if (x1 > x2) [x1, x2] = [x2, x1]
  if (y1 > y2) [y1, y2] = [y2, y1]

  const maxAbs = Math.max(
    Math.abs(x1),
    Math.abs(y1),
    Math.abs(x2),
    Math.abs(y2)
  )

  if (maxAbs <= 1 + EPSILON) {
    return [x1, y1, x2, y2]
  }

  if (page && page.width > 0 && page.height > 0) {
    const longEdge = Math.max(page.width, page.height)
    const fitsPage =
      x2 <= page.width * 1.05 + EPSILON &&
      y2 <= page.height * 1.05 + EPSILON

    const treatAsPixels =
      maxAbs > 1000 + EPSILON || (fitsPage && longEdge <= 1000 + EPSILON)

    if (treatAsPixels && fitsPage) {
      return [x1 / page.width, y1 / page.height, x2 / page.width, y2 / page.height]
    }

    if (maxAbs <= 1000 + EPSILON) {
      return [x1 / 1000, y1 / 1000, x2 / 1000, y2 / 1000]
    }

    if (fitsPage) {
      return [x1 / page.width, y1 / page.height, x2 / page.width, y2 / page.height]
    }

    return null
  }

  if (maxAbs <= 1000 + EPSILON) {
    return [x1 / 1000, y1 / 1000, x2 / 1000, y2 / 1000]
  }

  return null
}

/**
 * Clamp a normalized bbox to [0, 1] and enforce x2 > x1, y2 > y1.
 * Returns null if the box collapses to empty after clamping.
 */
export function clampNormalizedBbox(bbox: BBox): BBox | null {
  let [x1, y1, x2, y2] = bbox

  x1 = clamp(x1, 0, 1)
  y1 = clamp(y1, 0, 1)
  x2 = clamp(x2, 0, 1)
  y2 = clamp(y2, 0, 1)

  if (x1 > x2) [x1, x2] = [x2, x1]
  if (y1 > y2) [y1, y2] = [y2, y1]

  if (x2 - x1 < EPSILON || y2 - y1 < EPSILON) return null

  return [x1, y1, x2, y2]
}

/**
 * Validate a normalized bbox against AGENTS.md §4.2 (in 0–1 space).
 */
export function validateNormalizedBbox(bbox: BBox): BBoxValidationResult {
  const [x1, y1, x2, y2] = bbox

  if (!bbox.every((n) => Number.isFinite(n))) {
    return { ok: false, reason: "bbox contains non-finite values" }
  }
  if (x1 < 0 - EPSILON || y1 < 0 - EPSILON) {
    return { ok: false, reason: "bbox origin is outside the page" }
  }
  if (x2 > 1 + EPSILON || y2 > 1 + EPSILON) {
    return { ok: false, reason: "bbox extends beyond the page" }
  }
  if (x2 <= x1 + EPSILON || y2 <= y1 + EPSILON) {
    return { ok: false, reason: "bbox has zero or negative area" }
  }

  return { ok: true, bbox: clampNormalizedBbox(bbox)! }
}

/**
 * Convert + clamp + validate a raw model bbox into a safe normalized bbox.
 * Invalid / suspicious boxes return null (caller should drop the region).
 */
export function normalizeAndValidateBbox(
  raw: BBox,
  page?: PageSize
): BBox | null {
  const normalized = toNormalizedBbox(raw, page)
  if (!normalized) return null

  const clamped = clampNormalizedBbox(normalized)
  if (!clamped) return null

  const validated = validateNormalizedBbox(clamped)
  return validated.ok ? validated.bbox : null
}

/**
 * Normalize answer regions against known page sizes.
 * Drops invalid pages / empty boxes rather than rendering blindly.
 */
export function normalizeAnswerRegions(
  regions: Array<{ page: number; bbox: number[] | BBox }>,
  pageSizes: Map<number, PageSize>
): AnswerRegion[] {
  const result: AnswerRegion[] = []

  for (const region of regions) {
    if (!Number.isInteger(region.page) || region.page < 1) continue
    if (!Array.isArray(region.bbox) || region.bbox.length !== 4) continue

    const raw: BBox = [
      region.bbox[0]!,
      region.bbox[1]!,
      region.bbox[2]!,
      region.bbox[3]!,
    ]

    const pageSize = pageSizes.get(region.page)
    const bbox = normalizeAndValidateBbox(raw, pageSize)
    if (!bbox) continue

    // If we know page count via map, reject pages outside the sheet.
    if (pageSizes.size > 0 && !pageSizes.has(region.page)) continue

    result.push({ page: region.page, bbox })
  }

  return result
}
