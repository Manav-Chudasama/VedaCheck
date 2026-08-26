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
  /** Placeholder label until real rasters exist */
  label: string
}

export type AssessmentViewModel = {
  items: AssessmentItem[]
  pages: AnswerSheetPage[]
  unmatchedAnswers: StudentAnswer[]
}
