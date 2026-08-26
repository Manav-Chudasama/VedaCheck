/** Domain types for the assessment viewer. */

export type AnswerRegion = {
  page: number
  /** Normalized [x1, y1, x2, y2] in 0–1 relative to the page image. */
  bbox: [number, number, number, number]
}

export type QuestionGroup = {
  id: string
  /** Printed group number, e.g. "1", "2" */
  number: string
  /** Instruction text, e.g. "Attempt any FIVE of the following" */
  title: string
  /** How many options the student must attempt */
  attemptCount: number
  /** How many options are printed in the group */
  optionCount: number
  /** Total marks for the group (from the paper) */
  maxScore: number
  questionIds: string[]
}

export type Question = {
  id: string
  number: string
  text: string
  order: number
  maxScore?: number
  groupId?: string
  /** After attempt-any-N selection: whether this score counts toward totals */
  countedTowardTotal?: boolean
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

export type GroupScoreSummary = {
  groupId: string
  obtained: number
  maxScore: number
  countedQuestionIds: string[]
  excludedQuestionIds: string[]
}

export type AssessmentSummary = {
  paperMaxScore: number
  obtainedScore: number
  groupScores: GroupScoreSummary[]
}

export type AssessmentViewModel = {
  items: AssessmentItem[]
  groups: QuestionGroup[]
  pages: AnswerSheetPage[]
  unmatchedAnswers: StudentAnswer[]
  summary: AssessmentSummary
}
