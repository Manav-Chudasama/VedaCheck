import {
  ACCEPTED_UPLOAD_EXTENSIONS,
  ACCEPTED_UPLOAD_MIME_TYPES,
  MAX_IMAGE_PAGES,
  MAX_UPLOAD_BYTES,
} from "@/lib/upload/file-constraints"

export type ValidatedUpload = {
  field: "questionPaper" | "answerSheet"
  buffer: Buffer
  mimeType: string
  fileName: string
  size: number
}

export type UploadValidationError = {
  field?: "questionPaper" | "answerSheet" | "form"
  message: string
}

const FIELD_LABELS: Record<"questionPaper" | "answerSheet", string> = {
  questionPaper: "Question paper",
  answerSheet: "Answer sheet",
}

/** Infer MIME when the browser sends an empty / generic type. */
export function resolveUploadMimeType(
  mimeType: string | undefined,
  fileName: string
): string {
  const type = mimeType?.trim().toLowerCase()
  if (
    type &&
    type !== "application/octet-stream" &&
    ACCEPTED_UPLOAD_MIME_TYPES.includes(
      type as (typeof ACCEPTED_UPLOAD_MIME_TYPES)[number]
    )
  ) {
    return type === "image/jpg" ? "image/jpeg" : type
  }

  const name = fileName.toLowerCase()
  if (name.endsWith(".pdf")) return "application/pdf"
  if (name.endsWith(".png")) return "image/png"
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg"
  if (name.endsWith(".webp")) return "image/webp"
  return type || "application/octet-stream"
}

/** Strip path segments and unsafe characters from client filenames. */
export function sanitizeUploadFileName(fileName: string): string {
  const base = fileName.replace(/^.*[/\\]/, "").trim()
  const cleaned = base.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 120)
  return cleaned || "upload"
}

function hasAcceptedExtension(fileName: string): boolean {
  const name = fileName.toLowerCase()
  return ACCEPTED_UPLOAD_EXTENSIONS.some((ext) => name.endsWith(ext))
}

function isAcceptedMime(mimeType: string): boolean {
  return ACCEPTED_UPLOAD_MIME_TYPES.includes(
    mimeType as (typeof ACCEPTED_UPLOAD_MIME_TYPES)[number]
  )
}

function isPdfMime(mimeType: string, fileName: string): boolean {
  return (
    mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")
  )
}

function isImageMime(mimeType: string, fileName: string): boolean {
  if (mimeType.startsWith("image/")) return true
  const name = fileName.toLowerCase()
  return (
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp")
  )
}

/**
 * Validate a single multipart File field (MIME, extension, size).
 */
export function getServerUploadRejectionReason(
  file: File,
  field: "questionPaper" | "answerSheet"
): string | null {
  const label = FIELD_LABELS[field]
  const fileName = sanitizeUploadFileName(file.name || `${field}`)
  const mimeType = resolveUploadMimeType(file.type, fileName)

  if (!isAcceptedMime(mimeType) && !hasAcceptedExtension(fileName)) {
    return `${label}: use a PDF or image (PNG, JPG, WEBP).`
  }
  if (file.size <= 0) {
    return `${label}: file is empty.`
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `${label}: each file must be 10MB or smaller.`
  }
  return null
}

/**
 * Enforce one PDF XOR multiple images for a slot.
 */
export function validateUploadSlotFiles(
  files: File[],
  field: "questionPaper" | "answerSheet"
): string | null {
  const label = FIELD_LABELS[field]

  if (files.length === 0) {
    return `${label} file is required.`
  }

  for (const file of files) {
    const reason = getServerUploadRejectionReason(file, field)
    if (reason) return reason
  }

  const metas = files.map((file) => {
    const fileName = sanitizeUploadFileName(file.name || field)
    const mimeType = resolveUploadMimeType(file.type, fileName)
    return { fileName, mimeType }
  })

  const pdfCount = metas.filter((m) => isPdfMime(m.mimeType, m.fileName)).length
  const imageCount = metas.filter((m) =>
    isImageMime(m.mimeType, m.fileName)
  ).length

  if (pdfCount > 0 && imageCount > 0) {
    return `${label}: use either one PDF or multiple images — not both.`
  }

  if (pdfCount > 0) {
    if (files.length > 1) {
      return `${label}: upload only one PDF.`
    }
    return null
  }

  if (imageCount !== files.length) {
    return `${label}: unsupported file type.`
  }

  if (files.length > MAX_IMAGE_PAGES) {
    return `${label}: at most ${MAX_IMAGE_PAGES} images.`
  }

  return null
}

function collectFieldFiles(
  formData: FormData,
  field: "questionPaper" | "answerSheet"
): File[] {
  return formData
    .getAll(field)
    .filter((entry): entry is File => entry instanceof File && entry.size >= 0)
}

/**
 * Read + validate both required upload fields from multipart FormData.
 * Each field may be one PDF or one-or-more images (same field name repeated).
 */
export async function parseAssessmentUploadForm(
  formData: FormData
): Promise<
  | {
      ok: true
      questionPaper: ValidatedUpload[]
      answerSheet: ValidatedUpload[]
    }
  | { ok: false; error: UploadValidationError }
> {
  const questionPaperFiles = collectFieldFiles(formData, "questionPaper")
  const answerSheetFiles = collectFieldFiles(formData, "answerSheet")

  const qpReason = validateUploadSlotFiles(questionPaperFiles, "questionPaper")
  if (qpReason) {
    return {
      ok: false,
      error: { field: "questionPaper", message: qpReason },
    }
  }

  const asReason = validateUploadSlotFiles(answerSheetFiles, "answerSheet")
  if (asReason) {
    return {
      ok: false,
      error: { field: "answerSheet", message: asReason },
    }
  }

  const questionPaper = await Promise.all(
    questionPaperFiles.map((file) => toValidatedUpload(file, "questionPaper"))
  )
  const answerSheet = await Promise.all(
    answerSheetFiles.map((file) => toValidatedUpload(file, "answerSheet"))
  )

  return { ok: true, questionPaper, answerSheet }
}

async function toValidatedUpload(
  file: File,
  field: "questionPaper" | "answerSheet"
): Promise<ValidatedUpload> {
  const fileName = sanitizeUploadFileName(file.name || field)
  const mimeType = resolveUploadMimeType(file.type, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())

  return {
    field,
    buffer,
    mimeType,
    fileName,
    size: buffer.byteLength,
  }
}

/** Optional form flag — default true when absent. */
export function parseEnableGradingFlag(formData: FormData): boolean {
  const raw = formData.get("enableGrading")
  if (raw === null) return true
  if (typeof raw !== "string") return true
  const value = raw.trim().toLowerCase()
  return !(value === "false" || value === "0" || value === "no")
}
