import { describe, expect, test } from "bun:test"

import {
  canonicalizeQuestionLabel,
  mapAnswersDeterministic,
  mergeAnswerMappings,
} from "@/lib/assessment/map-answers"
import {
  fixtureExtractAnswers,
  fixtureExtractQuestions,
  fixtureMapAnswersLlm,
} from "@/lib/assessment/fixtures/gemini-responses"

describe("canonicalizeQuestionLabel", () => {
  test("normalizes common label variants", () => {
    expect(canonicalizeQuestionLabel("Q. 11 (a)")).toBe("11(a)")
    expect(canonicalizeQuestionLabel("Question 2")).toBe("2")
    expect(canonicalizeQuestionLabel("  1  ")).toBe("1")
  })
})

describe("mapAnswersDeterministic", () => {
  test("matches labels out of order and flags unmatched / unanswered", () => {
    const result = mapAnswersDeterministic(
      fixtureExtractQuestions.questions,
      fixtureExtractAnswers.answers
    )

    expect(result.mappings).toEqual([
      { answerIndex: 0, questionNumber: "11(a)", confidence: 0.95 },
      { answerIndex: 1, questionNumber: "1", confidence: 0.95 },
      { answerIndex: 2, questionNumber: "2", confidence: 0.95 },
      { answerIndex: 3, questionNumber: null, confidence: 0 },
    ])
    expect(result.unansweredQuestionNumbers).toEqual(["11(b)"])
    expect(result.unmatchedAnswerIndexes).toEqual([3])
  })
})

describe("mergeAnswerMappings", () => {
  test("keeps LLM mapping when valid and enforces one answer per question", () => {
    const base = mapAnswersDeterministic(
      fixtureExtractQuestions.questions,
      fixtureExtractAnswers.answers
    )
    const valid = new Set(
      fixtureExtractQuestions.questions.map((q) => q.number)
    )

    const merged = mergeAnswerMappings(
      base,
      fixtureMapAnswersLlm,
      valid,
      fixtureExtractAnswers.answers.length
    )

    expect(merged.mappings.find((m) => m.answerIndex === 3)?.questionNumber).toBeNull()
    expect(merged.unansweredQuestionNumbers).toContain("11(b)")
  })

  test("ignores invented question numbers from LLM", () => {
    const base = mapAnswersDeterministic(
      fixtureExtractQuestions.questions,
      fixtureExtractAnswers.answers
    )
    const valid = new Set(["1", "2", "11(a)", "11(b)"])

    const merged = mergeAnswerMappings(
      base,
      {
        mappings: [
          { answerIndex: 3, questionNumber: "99", confidence: 0.9 },
        ],
        unansweredQuestionNumbers: [],
        unmatchedAnswerIndexes: [],
      },
      valid,
      4
    )

    expect(merged.mappings.find((m) => m.answerIndex === 3)?.questionNumber).toBeNull()
  })
})
