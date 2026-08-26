import { describe, expect, test } from "bun:test"

import {
  fixtureExtractAnswers,
  fixtureExtractQuestions,
  fixtureGrades,
} from "@/lib/assessment/fixtures/gemini-responses"
import { mapAnswersDeterministic } from "@/lib/assessment/map-answers"
import {
  normalizeAssessment,
  normalizeQuestions,
} from "@/lib/assessment/normalize"
import type { PageRaster } from "@/lib/documents/types"

function fakePage(page: number, width = 1000, height = 1400): PageRaster {
  return {
    page,
    buffer: Buffer.from([0]),
    mimeType: "image/webp",
    width,
    height,
  }
}

describe("normalizeQuestions", () => {
  test("sorts by order and dedupes question numbers", () => {
    const questions = normalizeQuestions([
      { number: "2", text: "Second", order: 2 },
      { number: "1", text: "First", order: 1 },
      { number: "1", text: "Duplicate first", order: 0 },
      { number: "11(a)", text: "Part a", order: 3 },
      { number: "11(b)", text: "Part b", order: 4 },
    ])

    expect(questions.map((q) => q.number)).toEqual([
      "1",
      "2",
      "11(a)",
      "11(b)",
    ])
    expect(questions[0]?.text).toBe("Duplicate first")
    expect(questions.every((q, index) => q.order === index)).toBe(true)
  })

  test("preserves sub-part numbering exactly", () => {
    const questions = normalizeQuestions(fixtureExtractQuestions.questions)
    expect(questions.map((q) => q.number)).toContain("11(a)")
    expect(questions.map((q) => q.number)).toContain("11(b)")
  })
})

describe("normalizeAssessment", () => {
  test("builds answered / unanswered / unmatched with validated regions", () => {
    const mapping = mapAnswersDeterministic(
      fixtureExtractQuestions.questions,
      fixtureExtractAnswers.answers
    )

    const result = normalizeAssessment({
      assessmentId: "test-assessment",
      questions: fixtureExtractQuestions.questions,
      answers: fixtureExtractAnswers.answers,
      mapping,
      answerSheetPages: [fakePage(1), fakePage(2)],
      grades: fixtureGrades,
    })

    const byNumber = Object.fromEntries(
      result.items.map((item) => [item.question.number, item])
    )

    expect(byNumber["1"]?.status).toBe("answered")
    expect(byNumber["2"]?.status).toBe("answered")
    expect(byNumber["11(a)"]?.status).toBe("answered")
    expect(byNumber["11(b)"]?.status).toBe("unanswered")
    expect(byNumber["11(b)"]?.answer).toBeNull()

    expect(byNumber["1"]?.answer?.regions.length).toBe(2)
    expect(byNumber["2"]?.answer?.regions[0]?.bbox[0]).toBeCloseTo(0.1)
    expect(byNumber["1"]?.answer?.score).toBe(2)

    expect(result.unmatchedAnswers).toHaveLength(1)
    expect(result.unmatchedAnswers[0]?.transcription).toContain("Random margin")

    expect(result.pages).toEqual([
      {
        page: 1,
        label: "Page 1",
        imageUrl: "/api/assessments/test-assessment/pages/1",
        width: 1000,
        height: 1400,
      },
      {
        page: 2,
        label: "Page 2",
        imageUrl: "/api/assessments/test-assessment/pages/2",
        width: 1000,
        height: 1400,
      },
    ])
  })

  test("handles out-of-order answer labels via deterministic mapping", () => {
    const mapping = mapAnswersDeterministic(
      fixtureExtractQuestions.questions,
      fixtureExtractAnswers.answers
    )

    expect(mapping.mappings[0]?.questionNumber).toBe("11(a)")
    expect(mapping.mappings[1]?.questionNumber).toBe("1")
    expect(mapping.unansweredQuestionNumbers).toContain("11(b)")
    expect(mapping.unmatchedAnswerIndexes).toContain(3)
  })
})
