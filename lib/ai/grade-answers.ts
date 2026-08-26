import { generateStructuredJson } from "@/lib/ai/openai"
import { pageRastersToAiImages } from "@/lib/ai/page-images"
import {
  GRADE_ANSWERS_SYSTEM,
  buildGradeAnswersPrompt,
} from "@/lib/ai/prompts/grade-answers"
import { gradeAnswersResultSchema } from "@/lib/ai/schemas"
import type { GradeAnswersResultDto } from "@/lib/ai/types"
import type { PageRaster } from "@/lib/documents/types"

export type GradeAnswersInput = {
  pairs: Array<{
    questionNumber: string
    questionText: string
    maxScore: number
    transcription: string
  }>
  /** Optional answer-sheet page images covering the graded regions */
  images?: PageRaster[]
}

/** Keep grading context large; only soft-cap extreme outliers. */
const MAX_QUESTION_CHARS = 4000
const MAX_TRANSCRIPTION_CHARS = 12000

/**
 * Optional per-question scoring + teacher-facing feedback.
 */
export async function gradeAnswersWithOpenAi(
  input: GradeAnswersInput
): Promise<GradeAnswersResultDto> {
  if (input.pairs.length === 0) {
    return { grades: [], overallFeedback: null }
  }

  const pairs = input.pairs.map((pair) => ({
    ...pair,
    questionText: softTruncate(pair.questionText, MAX_QUESTION_CHARS),
    transcription: softTruncate(pair.transcription, MAX_TRANSCRIPTION_CHARS),
  }))

  const images = input.images?.length
    ? pageRastersToAiImages(input.images)
    : []

  const result = await generateStructuredJson({
    schema: gradeAnswersResultSchema,
    schemaName: "grade_answers",
    systemInstruction: GRADE_ANSWERS_SYSTEM,
    userText: buildGradeAnswersPrompt({ pairs }),
    images,
    temperature: 0.2,
  })

  // Clamp scores into [0, maxScore] — prefer the caller's maxScore when present.
  const maxByQuestion = new Map(
    input.pairs.map((pair) => [pair.questionNumber, pair.maxScore])
  )

  return {
    overallFeedback: result.overallFeedback,
    grades: result.grades.map((grade) => {
      const fromPair = maxByQuestion.get(grade.questionNumber)
      const maxScore =
        fromPair && fromPair > 0
          ? fromPair
          : grade.maxScore > 0
            ? grade.maxScore
            : 1
      const score = Math.min(maxScore, Math.max(0, grade.score))
      return {
        ...grade,
        maxScore,
        score,
      }
    }),
  }
}

function softTruncate(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}…`
}
