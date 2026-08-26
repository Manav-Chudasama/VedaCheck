import { describe, expect, test } from "bun:test"

import {
  clampNormalizedBbox,
  normalizeAndValidateBbox,
  normalizeAnswerRegions,
  toNormalizedBbox,
  validateNormalizedBbox,
} from "@/lib/assessment/bbox"

describe("toNormalizedBbox", () => {
  test("passes through already-normalized 0–1 boxes", () => {
    expect(toNormalizedBbox([0.1, 0.2, 0.9, 0.8])).toEqual([0.1, 0.2, 0.9, 0.8])
  })

  test("converts 0–1000 space without page size", () => {
    expect(toNormalizedBbox([100, 200, 900, 800])).toEqual([0.1, 0.2, 0.9, 0.8])
  })

  test("converts 0–1000 space on large pages", () => {
    expect(
      toNormalizedBbox([100, 200, 900, 800], { width: 2000, height: 2800 })
    ).toEqual([0.1, 0.2, 0.9, 0.8])
  })

  test("treats coordinates as pixels on small pages", () => {
    expect(
      toNormalizedBbox([10, 20, 90, 80], { width: 100, height: 100 })
    ).toEqual([0.1, 0.2, 0.9, 0.8])
  })

  test("treats large pixel coordinates as pixels", () => {
    const result = toNormalizedBbox([10, 20, 1900, 2500], {
      width: 2000,
      height: 2800,
    })
    expect(result?.[0]).toBeCloseTo(0.005)
    expect(result?.[2]).toBeCloseTo(0.95)
  })

  test("swaps inverted corners before normalizing", () => {
    expect(toNormalizedBbox([0.9, 0.8, 0.1, 0.2])).toEqual([0.1, 0.2, 0.9, 0.8])
  })

  test("returns null for non-finite values", () => {
    expect(toNormalizedBbox([0, 0, Number.NaN, 1])).toBeNull()
  })
})

describe("clampNormalizedBbox / validateNormalizedBbox", () => {
  test("clamps values into [0, 1]", () => {
    expect(clampNormalizedBbox([-0.1, 0.2, 1.2, 0.8])).toEqual([
      0, 0.2, 1, 0.8,
    ])
  })

  test("rejects zero-area boxes", () => {
    expect(clampNormalizedBbox([0.5, 0.5, 0.5, 0.8])).toBeNull()
    expect(validateNormalizedBbox([0.5, 0.2, 0.5, 0.8]).ok).toBe(false)
  })

  test("rejects boxes outside the page", () => {
    expect(validateNormalizedBbox([-0.2, 0.1, 0.5, 0.5]).ok).toBe(false)
    expect(validateNormalizedBbox([0.1, 0.1, 1.2, 0.5]).ok).toBe(false)
  })

  test("accepts a valid normalized box", () => {
    const result = validateNormalizedBbox([0.1, 0.2, 0.9, 0.8])
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.bbox).toEqual([0.1, 0.2, 0.9, 0.8])
  })
})

describe("normalizeAndValidateBbox / normalizeAnswerRegions", () => {
  test("returns null when scale cannot be inferred", () => {
    expect(normalizeAndValidateBbox([1500, 1600, 1800, 1900])).toBeNull()
  })

  test("drops invalid pages and empty boxes", () => {
    const pageSizes = new Map([
      [1, { width: 1000, height: 1400 }],
      [2, { width: 1000, height: 1400 }],
    ])

    const regions = normalizeAnswerRegions(
      [
        { page: 1, bbox: [0.1, 0.1, 0.9, 0.3] },
        { page: 0, bbox: [0.1, 0.1, 0.9, 0.3] },
        { page: 3, bbox: [0.1, 0.1, 0.9, 0.3] },
        { page: 2, bbox: [0.5, 0.5, 0.5, 0.5] },
      ],
      pageSizes
    )

    expect(regions).toEqual([{ page: 1, bbox: [0.1, 0.1, 0.9, 0.3] }])
  })
})
