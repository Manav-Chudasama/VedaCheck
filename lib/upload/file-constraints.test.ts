import { describe, expect, test } from "bun:test"

import {
  mergeUploadSelection,
  MAX_IMAGE_PAGES,
} from "@/lib/upload/file-constraints"
import { validateUploadSlotFiles } from "@/lib/upload/validate-upload"

function fakeFile(
  name: string,
  type: string,
  size = 100
): File {
  const bytes = new Uint8Array(size)
  return new File([bytes], name, { type })
}

describe("mergeUploadSelection", () => {
  test("accepts a single PDF", () => {
    const pdf = fakeFile("paper.pdf", "application/pdf")
    const result = mergeUploadSelection([], [pdf])
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.files).toEqual([pdf])
  })

  test("rejects multiple PDFs", () => {
    const result = mergeUploadSelection(
      [],
      [
        fakeFile("a.pdf", "application/pdf"),
        fakeFile("b.pdf", "application/pdf"),
      ]
    )
    expect(result.ok).toBe(false)
  })

  test("appends multiple images", () => {
    const a = fakeFile("1.png", "image/png")
    const b = fakeFile("2.jpg", "image/jpeg")
    const first = mergeUploadSelection([], [a])
    expect(first.ok).toBe(true)
    if (!first.ok) return
    const second = mergeUploadSelection(first.files, [b])
    expect(second.ok).toBe(true)
    if (second.ok) expect(second.files).toHaveLength(2)
  })

  test("rejects mixing PDF with images", () => {
    const images = [fakeFile("1.png", "image/png")]
    const result = mergeUploadSelection(images, [
      fakeFile("paper.pdf", "application/pdf"),
    ])
    expect(result.ok).toBe(false)
  })

  test("replaces existing PDF when picking another PDF", () => {
    const first = fakeFile("old.pdf", "application/pdf")
    const next = fakeFile("new.pdf", "application/pdf")
    const result = mergeUploadSelection([first], [next])
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.files[0]?.name).toBe("new.pdf")
  })
})

describe("validateUploadSlotFiles", () => {
  test("requires at least one file", () => {
    expect(validateUploadSlotFiles([], "questionPaper")).toContain("required")
  })

  test("allows one PDF", () => {
    expect(
      validateUploadSlotFiles(
        [fakeFile("qp.pdf", "application/pdf")],
        "questionPaper"
      )
    ).toBeNull()
  })

  test("rejects two PDFs", () => {
    expect(
      validateUploadSlotFiles(
        [
          fakeFile("a.pdf", "application/pdf"),
          fakeFile("b.pdf", "application/pdf"),
        ],
        "answerSheet"
      )
    ).toContain("only one PDF")
  })

  test("allows multiple images", () => {
    expect(
      validateUploadSlotFiles(
        [
          fakeFile("1.png", "image/png"),
          fakeFile("2.png", "image/png"),
          fakeFile("3.webp", "image/webp"),
        ],
        "answerSheet"
      )
    ).toBeNull()
  })

  test("rejects more than MAX_IMAGE_PAGES images", () => {
    const files = Array.from({ length: MAX_IMAGE_PAGES + 1 }, (_, i) =>
      fakeFile(`${i}.png`, "image/png")
    )
    expect(validateUploadSlotFiles(files, "questionPaper")).toContain(
      String(MAX_IMAGE_PAGES)
    )
  })
})
