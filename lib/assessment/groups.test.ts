import { describe, expect, test } from "bun:test"

import { applyAttemptRules } from "@/lib/assessment/apply-attempt-rules"
import { refineOverlappingAnswerRegions } from "@/lib/assessment/bbox-refine"
import { fixtureMsbteStyleQuestions } from "@/lib/assessment/fixtures/ai-responses"
import { normalizeQuestionsAndGroups } from "@/lib/assessment/normalize-groups"
import type { AssessmentItem, QuestionGroup } from "@/lib/assessment/types"

describe("normalizeQuestionsAndGroups", () => {
  test("derives per-option marks from group max / attemptCount (MSBTE-style)", () => {
    const { questions, groups, hasUnknownMaxScores } =
      normalizeQuestionsAndGroups(fixtureMsbteStyleQuestions)

    expect(hasUnknownMaxScores).toBe(false)
    expect(groups).toHaveLength(2)

    const g1 = groups.find((g) => g.number === "1")
    const g2 = groups.find((g) => g.number === "2")
    expect(g1?.maxScore).toBe(10)
    expect(g1?.attemptCount).toBe(5)
    expect(g2?.maxScore).toBe(12)
    expect(g2?.attemptCount).toBe(3)

    const q1a = questions.find((q) => q.number === "1(a)")
    const q2a = questions.find((q) => q.number === "2(a)")
    expect(q1a?.maxScore).toBe(2)
    expect(q2a?.maxScore).toBe(4)
    expect(q1a?.groupId).toBe(g1?.id)
  })
})

describe("applyAttemptRules", () => {
  test("counts only top N scores per group toward totals", () => {
    const { questions, groups } = normalizeQuestionsAndGroups(
      fixtureMsbteStyleQuestions
    )

    const g1 = groups.find((g) => g.number === "1")!
    // Seven attempted answers with descending scores 2,2,2,2,2,1,0
    const scores = [2, 2, 2, 2, 2, 1, 0]
    const items: AssessmentItem[] = questions
      .filter((q) => q.groupId === g1.id)
      .map((question, index) => ({
        question: { ...question },
        answer: {
          questionId: question.id,
          transcription: `answer ${question.number}`,
          regions: [{ page: 1, bbox: [0.1, 0.1, 0.9, 0.2] as [number, number, number, number] }],
          score: scores[index]!,
          maxScore: question.maxScore,
        },
        status: "answered" as const,
      }))

    // Add unanswered group-2 options so groups array is complete
    const g2Items: AssessmentItem[] = questions
      .filter((q) => q.groupId !== g1.id)
      .map((question) => ({
        question: { ...question },
        answer: null,
        status: "unanswered" as const,
      }))

    const { items: scored, summary } = applyAttemptRules({
      items: [...items, ...g2Items],
      groups,
      paperMaxScore: 70,
    })

    const counted = scored.filter(
      (i) => i.question.groupId === g1.id && i.question.countedTowardTotal
    )
    const excluded = scored.filter(
      (i) =>
        i.question.groupId === g1.id &&
        i.question.countedTowardTotal === false &&
        i.status === "answered"
    )

    expect(counted).toHaveLength(5)
    expect(excluded).toHaveLength(2)
    expect(summary.paperMaxScore).toBe(70)

    const g1Summary = summary.groupScores.find((g) => g.groupId === g1.id)!
    expect(g1Summary.obtained).toBe(10) // 5 × 2, capped at group max 10
    expect(g1Summary.countedQuestionIds).toHaveLength(5)
    expect(g1Summary.excludedQuestionIds).toHaveLength(2)
    expect(summary.obtainedScore).toBe(10)
  })

  test("builds empty group scores when nothing attempted", () => {
    const groups: QuestionGroup[] = [
      {
        id: "group-1",
        number: "1",
        title: "Attempt any 2",
        attemptCount: 2,
        optionCount: 3,
        maxScore: 10,
        questionIds: ["q-a", "q-b", "q-c"],
      },
    ]
    const items: AssessmentItem[] = groups[0]!.questionIds.map((id, index) => ({
      question: {
        id,
        number: `1(${String.fromCharCode(97 + index)})`,
        text: "x",
        order: index,
        maxScore: 5,
        groupId: "group-1",
      },
      answer: null,
      status: "unanswered" as const,
    }))

    const { summary } = applyAttemptRules({
      items,
      groups,
      paperMaxScore: 10,
    })
    expect(summary.obtainedScore).toBe(0)
    expect(summary.groupScores[0]?.countedQuestionIds).toEqual([])
  })
})

describe("refineOverlappingAnswerRegions", () => {
  test("shrinks earlier overlapping box above the later answer", () => {
    const refined = refineOverlappingAnswerRegions([
      {
        regions: [{ page: 1, bbox: [0.1, 0.1, 0.9, 0.6] }],
      },
      {
        regions: [{ page: 1, bbox: [0.1, 0.4, 0.9, 0.7] }],
      },
    ])

    const earlier = refined[0]!.regions[0]!.bbox
    const later = refined[1]!.regions[0]!.bbox

    expect(earlier[3]).toBeLessThanOrEqual(later[1] + 0.001)
    expect(earlier[3]).toBeGreaterThan(earlier[1])
    expect(later).toEqual([0.1, 0.4, 0.9, 0.7])
  })

  test("does not shrink regions belonging to the same answer", () => {
    const refined = refineOverlappingAnswerRegions([
      {
        regions: [
          { page: 1, bbox: [0.1, 0.1, 0.9, 0.4] },
          { page: 1, bbox: [0.1, 0.35, 0.9, 0.55] },
        ],
      },
    ])
    expect(refined[0]!.regions).toHaveLength(2)
    expect(refined[0]!.regions[0]!.bbox[3]).toBeCloseTo(0.4)
  })
})
