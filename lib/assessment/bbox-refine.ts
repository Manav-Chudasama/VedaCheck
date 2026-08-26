import type { AnswerRegion } from "@/lib/assessment/types"
import type { BBox } from "@/lib/assessment/bbox"

const EPSILON = 1e-6
/** Overlap IoU (or vertical containment) above this triggers a shrink. */
const OVERLAP_THRESHOLD = 0.15
/** Minimum height kept after shrinking (normalized). */
const MIN_HEIGHT = 0.02

function area(bbox: BBox): number {
  const [x1, y1, x2, y2] = bbox
  return Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
}

function intersectionArea(a: BBox, b: BBox): number {
  const x1 = Math.max(a[0], b[0])
  const y1 = Math.max(a[1], b[1])
  const x2 = Math.min(a[2], b[2])
  const y2 = Math.min(a[3], b[3])
  if (x2 <= x1 + EPSILON || y2 <= y1 + EPSILON) return 0
  return (x2 - x1) * (y2 - y1)
}

function iou(a: BBox, b: BBox): number {
  const inter = intersectionArea(a, b)
  if (inter <= EPSILON) return 0
  const union = area(a) + area(b) - inter
  return union > EPSILON ? inter / union : 0
}

/**
 * If two mapped answers overlap heavily on the same page, shrink the earlier
 * box so it ends just above the later box’s top. Drops near-empty residuals.
 *
 * Operates on already-normalized regions (0–1). Mutates a deep copy.
 */
export function refineOverlappingAnswerRegions(
  answers: Array<{ regions: AnswerRegion[] }>
): Array<{ regions: AnswerRegion[] }> {
  type Tagged = {
    answerIndex: number
    regionIndex: number
    page: number
    bbox: BBox
  }

  const tagged: Tagged[] = []
  const cloned = answers.map((a) => ({
    regions: a.regions.map((r) => ({
      page: r.page,
      bbox: [...r.bbox] as BBox,
    })),
  }))

  cloned.forEach((answer, answerIndex) => {
    answer.regions.forEach((region, regionIndex) => {
      tagged.push({
        answerIndex,
        regionIndex,
        page: region.page,
        bbox: region.bbox,
      })
    })
  })

  // Process earlier (top) boxes against later ones on the same page.
  tagged.sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page
    if (a.bbox[1] !== b.bbox[1]) return a.bbox[1] - b.bbox[1]
    return a.answerIndex - b.answerIndex
  })

  for (let i = 0; i < tagged.length; i++) {
    const earlier = tagged[i]!
    for (let j = i + 1; j < tagged.length; j++) {
      const later = tagged[j]!
      if (earlier.page !== later.page) continue
      // Same answer's multi-regions may intentionally abut — skip same answer.
      if (earlier.answerIndex === later.answerIndex) continue

      const overlap = iou(earlier.bbox, later.bbox)
      const laterStartsInsideEarlier =
        later.bbox[1] >= earlier.bbox[1] - EPSILON &&
        later.bbox[1] < earlier.bbox[3] - EPSILON &&
        intersectionArea(earlier.bbox, later.bbox) >
          area(later.bbox) * OVERLAP_THRESHOLD

      if (overlap < OVERLAP_THRESHOLD && !laterStartsInsideEarlier) continue

      // Shrink earlier box to end just above later's top.
      const newY2 = Math.max(earlier.bbox[1] + MIN_HEIGHT, later.bbox[1] - 0.005)
      if (newY2 < earlier.bbox[3] - EPSILON) {
        earlier.bbox[3] = newY2
        const target =
          cloned[earlier.answerIndex]!.regions[earlier.regionIndex]!
        target.bbox = [...earlier.bbox] as BBox
      }
    }
  }

  // Drop collapsed / near-empty boxes.
  for (const answer of cloned) {
    answer.regions = answer.regions.filter((r) => {
      const [x1, y1, x2, y2] = r.bbox
      return x2 - x1 >= EPSILON && y2 - y1 >= MIN_HEIGHT - EPSILON
    })
  }

  return cloned
}
