import type {
  ExtractedQuestionDto,
  ExtractedQuestionGroupDto,
} from "@/lib/ai/types"
import type { Question, QuestionGroup } from "@/lib/assessment/types"

export type NormalizedQuestionsAndGroups = {
  questions: Question[]
  groups: QuestionGroup[]
  /** True when any question still has no known maxScore after derivation */
  hasUnknownMaxScores: boolean
}

function canonicalizeId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

/**
 * Infer a parent group number from a printed label like "1(a)", "1.a", "Q1(b)".
 */
export function inferGroupNumberFromLabel(number: string): string | null {
  const trimmed = number.trim()
  const match = trimmed.match(
    /^(?:q\.?\s*)?(\d+)\s*[\(\.\-]?\s*[a-z]/i
  )
  if (!match) return null
  return match[1] ?? null
}

/**
 * Derive per-option marks: group.maxScore / attemptCount when sub-part
 * maxScore is missing. Attaches groupId on each question.
 */
export function normalizeQuestionsAndGroups(input: {
  questions: ExtractedQuestionDto[]
  groups: ExtractedQuestionGroupDto[]
}): NormalizedQuestionsAndGroups {
  const seen = new Set<string>()
  const sorted = [...input.questions].sort((a, b) => a.order - b.order)
  const uniqueQuestions: ExtractedQuestionDto[] = []

  for (const q of sorted) {
    const number = q.number.trim()
    if (!number || seen.has(number)) continue
    seen.add(number)
    uniqueQuestions.push({
      ...q,
      number,
      text: q.text.trim(),
    })
  }

  const groupByNumber = new Map<string, ExtractedQuestionGroupDto>()
  for (const g of input.groups) {
    const number = g.number.trim()
    if (!number || groupByNumber.has(number)) continue
    groupByNumber.set(number, {
      ...g,
      number,
      title: g.title.trim(),
      attemptCount: Math.max(1, Math.floor(g.attemptCount)),
      optionCount: Math.max(1, Math.floor(g.optionCount)),
      maxScore:
        g.maxScore === null || g.maxScore === undefined
          ? null
          : Math.max(0, g.maxScore),
    })
  }

  // Ensure a group exists for every referenced groupNumber / inferred label.
  for (const q of uniqueQuestions) {
    const inferred =
      (q.groupNumber?.trim() || null) ?? inferGroupNumberFromLabel(q.number)
    if (!inferred) continue
    if (groupByNumber.has(inferred)) continue
    groupByNumber.set(inferred, {
      number: inferred,
      title: `Question ${inferred}`,
      attemptCount: 1,
      optionCount: 1,
      maxScore: null,
    })
  }

  const questions: Question[] = uniqueQuestions.map((q, index) => {
    const groupNumber =
      (q.groupNumber?.trim() || null) ?? inferGroupNumberFromLabel(q.number)
    const group = groupNumber ? groupByNumber.get(groupNumber) : undefined

    let maxScore: number | undefined =
      q.maxScore === null || q.maxScore === undefined
        ? undefined
        : q.maxScore

    if (
      (maxScore === undefined || maxScore <= 0) &&
      group &&
      group.maxScore !== null &&
      group.maxScore > 0 &&
      group.attemptCount > 0
    ) {
      maxScore = group.maxScore / group.attemptCount
    }

    return {
      id: `q-${canonicalizeId(q.number)}-${index}`,
      number: q.number,
      text: q.text,
      order: index,
      maxScore,
      groupId: group ? `group-${canonicalizeId(group.number)}` : undefined,
    }
  })

  const groups: QuestionGroup[] = [...groupByNumber.values()]
    .sort((a, b) => Number(a.number) - Number(b.number) || a.number.localeCompare(b.number))
    .map((g) => {
      const id = `group-${canonicalizeId(g.number)}`
      const questionIds = questions
        .filter((q) => q.groupId === id)
        .map((q) => q.id)

      const optionCount = Math.max(g.optionCount, questionIds.length || 1)
      let maxScore = g.maxScore ?? 0
      if (maxScore <= 0) {
        // Sum explicit per-question marks when group total was missing.
        const sum = questions
          .filter((q) => q.groupId === id)
          .reduce((acc, q) => acc + (q.maxScore ?? 0), 0)
        maxScore = sum
      }

      return {
        id,
        number: g.number,
        title: g.title || `Question ${g.number}`,
        attemptCount: Math.min(g.attemptCount, optionCount),
        optionCount,
        maxScore,
        questionIds,
      }
    })
    .filter((g) => g.questionIds.length > 0)

  // Orphan questions without a group: leave as-is (flat list items).
  const hasUnknownMaxScores = questions.some(
    (q) => q.maxScore === undefined || q.maxScore <= 0
  )

  return { questions, groups, hasUnknownMaxScores }
}
