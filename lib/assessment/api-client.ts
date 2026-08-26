import type { ProcessingStage } from "@/lib/assessment/stages"
import type { AssessmentViewModel } from "@/lib/assessment/types"

export type CreateAssessmentResponse = {
  id: string
  statusUrl: string
  resultUrl: string
}

export type AssessmentStatusResponse = {
  id: string
  stage: ProcessingStage
  progress: number
  error?: string
  label: string
}

export type AssessmentResultResponse = AssessmentViewModel & {
  overallFeedback?: string | null
}

export class AssessmentApiError extends Error {
  readonly status: number
  readonly payload?: unknown

  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.name = "AssessmentApiError"
    this.status = status
    this.payload = payload
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: string | { message?: string }
    }
    if (typeof data.error === "string") return data.error
    if (data.error && typeof data.error === "object" && data.error.message) {
      return data.error.message
    }
  } catch {
    // fall through
  }
  return `Request failed (${response.status})`
}

/**
 * Upload question paper + answer sheet; returns assessment job id.
 */
export async function createAssessment(files: {
  questionPaper: File
  answerSheet: File
  enableGrading?: boolean
}): Promise<CreateAssessmentResponse> {
  const formData = new FormData()
  formData.append("questionPaper", files.questionPaper)
  formData.append("answerSheet", files.answerSheet)
  if (files.enableGrading === false) {
    formData.append("enableGrading", "false")
  }

  const response = await fetch("/api/assessments", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new AssessmentApiError(
      await readErrorMessage(response),
      response.status
    )
  }

  return (await response.json()) as CreateAssessmentResponse
}

export async function fetchAssessmentStatus(
  id: string
): Promise<AssessmentStatusResponse> {
  const response = await fetch(`/api/assessments/${id}/status`, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new AssessmentApiError(
      await readErrorMessage(response),
      response.status
    )
  }

  return (await response.json()) as AssessmentStatusResponse
}

export async function fetchAssessmentResult(
  id: string
): Promise<AssessmentResultResponse> {
  const response = await fetch(`/api/assessments/${id}/result`, {
    cache: "no-store",
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => undefined)
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof (payload as { error: unknown }).error === "string"
        ? (payload as { error: string }).error
        : `Request failed (${response.status})`

    throw new AssessmentApiError(message, response.status, payload)
  }

  return (await response.json()) as AssessmentResultResponse
}
