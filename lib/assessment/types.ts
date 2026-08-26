/** Domain types for the assessment viewer (UI-ready; pipeline will populate later). */

export type AnswerRegion = {
  page: number
  /** Normalized [x1, y1, x2, y2] in 0–1 relative to the page image. */
  bbox: [number, number, number, number]
}

export type Question = {
  id: string
  number: string
  text: string
  order: number
  maxScore?: number
}

export type StudentAnswer = {
  questionId: string | null
  transcription: string
  regions: AnswerRegion[]
  confidence?: number
  score?: number
  maxScore?: number
  feedback?: string
}

export type AssessmentItemStatus = "answered" | "unanswered" | "unmatched"

export type AssessmentItem = {
  question: Question
  answer: StudentAnswer | null
  status: AssessmentItemStatus
}

export type AnswerSheetPage = {
  page: number
  label: string
  /**
   * URL for the page raster (e.g. `/api/assessments/{id}/pages/{n}`).
   * Omit to show the lined placeholder in the viewer.
   */
  imageUrl?: string
  /** Pixel width of the stored raster (for aspect ratio / bbox scaling). */
  width?: number
  /** Pixel height of the stored raster. */
  height?: number
}

export type AssessmentViewModel = {
  items: AssessmentItem[]
  pages: AnswerSheetPage[]
  unmatchedAnswers: StudentAnswer[]
}
