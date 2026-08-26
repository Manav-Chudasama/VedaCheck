import { describe, expect, test } from "bun:test"

import {
  extractAnswersResultSchema,
  extractQuestionsResultSchema,
  gradeAnswersResultSchema,
  mapAnswersResultSchema,
} from "@/lib/ai/schemas"
import {
  fixtureExtractAnswers,
  fixtureExtractQuestions,
  fixtureGrades,
  fixtureInvalidExtractAnswers,
  fixtureInvalidExtractQuestions,
  fixtureMapAnswersLlm,
} from "@/lib/assessment/fixtures/ai-responses"

describe("AI Zod schemas", () => {
  test("accepts valid extract-questions fixture", () => {
    const parsed = extractQuestionsResultSchema.safeParse(
      fixtureExtractQuestions
    )
    expect(parsed.success).toBe(true)
  })

  test("rejects empty question numbers", () => {
    const parsed = extractQuestionsResultSchema.safeParse(
      fixtureInvalidExtractQuestions
    )
    expect(parsed.success).toBe(false)
  })

  test("accepts valid extract-answers fixture (incl. multi-region)", () => {
    const parsed = extractAnswersResultSchema.safeParse(fixtureExtractAnswers)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.answers[1]?.regions).toHaveLength(2)
    }
  })

  test("rejects answers with empty regions", () => {
    const parsed = extractAnswersResultSchema.safeParse(
      fixtureInvalidExtractAnswers
    )
    expect(parsed.success).toBe(false)
  })

  test("accepts valid map-answers fixture", () => {
    const parsed = mapAnswersResultSchema.safeParse(fixtureMapAnswersLlm)
    expect(parsed.success).toBe(true)
  })

  test("rejects map payload with negative answerIndex", () => {
    const parsed = mapAnswersResultSchema.safeParse({
      mappings: [{ answerIndex: -1, questionNumber: "1" }],
      unansweredQuestionNumbers: [],
      unmatchedAnswerIndexes: [],
    })
    expect(parsed.success).toBe(false)
  })

  test("accepts valid grade-answers fixture", () => {
    const parsed = gradeAnswersResultSchema.safeParse(fixtureGrades)
    expect(parsed.success).toBe(true)
  })

  test("rejects grades with non-positive maxScore", () => {
    const parsed = gradeAnswersResultSchema.safeParse({
      grades: [
        {
          questionNumber: "1",
          score: 0,
          maxScore: 0,
          feedback: "bad",
        },
      ],
    })
    expect(parsed.success).toBe(false)
  })
})
