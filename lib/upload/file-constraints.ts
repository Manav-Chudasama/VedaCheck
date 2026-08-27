/** Shared upload constraints — UI validation before the processing pipeline. */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10MB per file
/** Max images when uploading page photos instead of a PDF. */
export const MAX_IMAGE_PAGES = 30

export const ACCEPTED_UPLOAD_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const

export const ACCEPTED_UPLOAD_EXTENSIONS = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
] as const

export const ACCEPT_ATTR = [
  ...ACCEPTED_UPLOAD_MIME_TYPES,
  ...ACCEPTED_UPLOAD_EXTENSIONS,
].join(",")

export type UploadSlot = "questionPaper" | "answerSheet"

export function isPdfFile(file: File): boolean {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  )
}

export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true
  const name = file.name.toLowerCase()
  return (
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp")
  )
}

/**
 * Merge newly picked files into the current selection.
 * PDF → exactly one file. Images → multiple (append). No PDF+image mix.
 */
export function mergeUploadSelection(
  current: File[],
  incoming: File[]
): { ok: true; files: File[] } | { ok: false; message: string } {
  if (incoming.length === 0) {
    return { ok: true, files: current }
  }

  for (const file of incoming) {
    const reason = getUploadRejectionReason(file)
    if (reason) return { ok: false, message: reason }
  }

  const incomingHasPdf = incoming.some(isPdfFile)
  const incomingHasImage = incoming.some(isImageFile)
  const currentHasPdf = current.some(isPdfFile)
  const currentHasImage = current.some(isImageFile)

  if (incomingHasPdf && incomingHasImage) {
    return {
      ok: false,
      message: "Use either one PDF or multiple images — not both.",
    }
  }

  if (incomingHasPdf) {
    if (incoming.length > 1) {
      return { ok: false, message: "Upload only one PDF." }
    }
    if (currentHasImage) {
      return {
        ok: false,
        message: "Remove images first, or replace with a single PDF.",
      }
    }
    // Replace any existing PDF with the new one.
    return { ok: true, files: [incoming[0]!] }
  }

  // Images path
  if (currentHasPdf) {
    return {
      ok: false,
      message: "Remove the PDF first, or add images instead of a PDF.",
    }
  }

  const next = [...current]
  for (const file of incoming) {
    const duplicate = next.some(
      (existing) =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified
    )
    if (!duplicate) next.push(file)
  }

  if (next.length > MAX_IMAGE_PAGES) {
    return {
      ok: false,
      message: `You can upload at most ${MAX_IMAGE_PAGES} images.`,
    }
  }

  return { ok: true, files: next }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
  }
  const mb = bytes / (1024 * 1024)
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}

/** Compact size label matching filled-state SVG (`2MB • 2 Pages`). */
export function formatCompactFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024
    const value = kb < 10 && !Number.isInteger(kb) ? kb.toFixed(1) : Math.round(kb)
    return `${value}KB`
  }
  const mb = bytes / (1024 * 1024)
  const value = mb < 10 && !Number.isInteger(mb) ? mb.toFixed(1) : Math.round(mb)
  return `${value}MB`
}

export function isAcceptedUploadFile(file: File): boolean {
  const mimeOk = ACCEPTED_UPLOAD_MIME_TYPES.includes(
    file.type as (typeof ACCEPTED_UPLOAD_MIME_TYPES)[number]
  )
  const name = file.name.toLowerCase()
  const extOk = ACCEPTED_UPLOAD_EXTENSIONS.some((ext) => name.endsWith(ext))
  return mimeOk || extOk
}

export function getUploadRejectionReason(file: File): string | null {
  if (!isAcceptedUploadFile(file)) {
    return "Use a PDF or image (PNG, JPG, WEBP)."
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "File must be 10MB or smaller."
  }
  return null
}

export function fileTypeLabel(file: File): string {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "PDF"
  }
  return "Image"
}

/**
 * Page count for the filled upload chip.
 * Images → 1. PDFs → count `/Type /Page` markers (good enough until pdfjs pipeline).
 */
export async function getDocumentPageCount(file: File): Promise<number> {
  if (fileTypeLabel(file) !== "PDF") return 1

  try {
    const buffer = await file.arrayBuffer()
    const text = new TextDecoder("latin1").decode(buffer)
    const pages = text.match(/\/Type\s*\/Page(?!\s*s)\b/g)
    if (pages && pages.length > 0) return pages.length

    const countMatches = [...text.matchAll(/\/Count\s+(\d+)/g)].map((m) =>
      Number.parseInt(m[1], 10)
    )
    if (countMatches.length > 0) return Math.max(...countMatches)
  } catch {
    // Fall through
  }

  return 1
}
