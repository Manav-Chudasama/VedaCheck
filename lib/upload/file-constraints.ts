/** Shared upload constraints — UI validation before the processing pipeline. */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10MB

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

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024
    return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`
  }
  const mb = bytes / (1024 * 1024)
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
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
