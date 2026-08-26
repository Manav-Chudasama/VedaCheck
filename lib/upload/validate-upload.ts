import {
  ACCEPTED_UPLOAD_EXTENSIONS,
  ACCEPTED_UPLOAD_MIME_TYPES,
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

/**
 * Validate a single multipart File field (MIME, extension, size).
 * Returns a structured error message or null when valid.
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
    return `${label}: file must be 10MB or smaller.`
  }
  return null
}

/**
 * Read + validate both required upload fields from multipart FormData.
 */
export async function parseAssessmentUploadForm(
  formData: FormData
): Promise<
  | { ok: true; questionPaper: ValidatedUpload; answerSheet: ValidatedUpload }
  | { ok: false; error: UploadValidationError }
> {
  const questionPaperFile = formData.get("questionPaper")
  const answerSheetFile = formData.get("answerSheet")

  if (!(questionPaperFile instanceof File)) {
    return {
      ok: false,
      error: {
        field: "questionPaper",
        message: "Question paper file is required.",
      },
    }
  }
  if (!(answerSheetFile instanceof File)) {
    return {
      ok: false,
      error: {
        field: "answerSheet",
        message: "Answer sheet file is required.",
      },
    }
  }

  const qpReason = getServerUploadRejectionReason(
    questionPaperFile,
    "questionPaper"
  )
  if (qpReason) {
    return {
      ok: false,
      error: { field: "questionPaper", message: qpReason },
    }
  }

  const asReason = getServerUploadRejectionReason(
    answerSheetFile,
    "answerSheet"
  )
  if (asReason) {
    return {
      ok: false,
      error: { field: "answerSheet", message: asReason },
    }
  }

  const questionPaper = await toValidatedUpload(
    questionPaperFile,
    "questionPaper"
  )
  const answerSheet = await toValidatedUpload(answerSheetFile, "answerSheet")

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
