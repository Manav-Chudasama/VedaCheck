import { generateStructuredJson } from "@/lib/ai/gemini"
import {
  GRADE_ANSWERS_SYSTEM,
  buildGradeAnswersPrompt,
} from "@/lib/ai/prompts/grade-answers"
import { gradeAnswersResultSchema } from "@/lib/ai/schemas"
import type { GradeAnswersResultDto } from "@/lib/ai/types"

export type GradeAnswersInput = {
  pairs: Array<{
    questionNumber: string
    questionText: string
    maxScore: number
    transcription: string
  }>
}

/**
 * Optional per-question scoring + teacher-facing feedback.
 */
export async function gradeAnswersWithGemini(
  input: GradeAnswersInput
): Promise<GradeAnswersResultDto> {
  if (input.pairs.length === 0) {
    return { grades: [], overallFeedback: null }
  }

  const pairs = input.pairs.map((pair) => ({
    ...pair,
    questionText: truncate(pair.questionText, 600),
    transcription: truncate(pair.transcription, 800),
  }))

  const result = await generateStructuredJson({
    schema: gradeAnswersResultSchema,
    systemInstruction: GRADE_ANSWERS_SYSTEM,
    contents: buildGradeAnswersPrompt({ pairs }),
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

function truncate(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}…`
}
