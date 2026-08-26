/**
 * Internal AI DTOs — raw model pipeline shapes before normalization
 * into AssessmentViewModel (lib/assessment/types.ts).
 */

/** Page image payload sent to the vision model (base64, no data-URL prefix). */
export type AiImagePart = {
  mimeType: string
  /** Raw bytes or base64 string */
  data: Buffer | Uint8Array | string
}

export type ExtractedQuestionDto = {
  /** Exact printed label, e.g. "11(a)" or "Q2" */
  number: string
  text: string
  /** 0-based printed order */
  order: number
  maxScore?: number | null
}

export type ExtractQuestionsResultDto = {
  questions: ExtractedQuestionDto[]
}

/** Bounding box as [x1, y1, x2, y2], normalized 0–1 relative to the page. */
export type BBoxDto = number[]

export type AnswerRegionDto = {
  /** 1-based page index on the answer sheet */
  page: number
  bbox: BBoxDto
}

export type ExtractedAnswerDto = {
  /**
   * Question label as written by the student, if any.
   * Null when the answer block has no identifiable label.
   */
  questionLabel: string | null
  transcription: string
  regions: AnswerRegionDto[]
  confidence?: number | null
}

export type ExtractAnswersResultDto = {
  answers: ExtractedAnswerDto[]
}

export type MappedAnswerDto = {
  /** Index into the extracted answers array */
  answerIndex: number
  /** Matching question `number` string, or null if unmatched */
  questionNumber: string | null
  confidence?: number | null
}

export type MapAnswersResultDto = {
  mappings: MappedAnswerDto[]
  /** Question numbers with no mapped answer */
  unansweredQuestionNumbers: string[]
  /** Answer indexes that could not be mapped to any question */
  unmatchedAnswerIndexes: number[]
}

export type GradedAnswerDto = {
  questionNumber: string
  score: number
  maxScore: number
  feedback: string
}

export type GradeAnswersResultDto = {
  grades: GradedAnswerDto[]
  overallFeedback?: string | null
}
