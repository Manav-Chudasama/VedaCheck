import type {
  ExtractedAnswerDto,
  ExtractedQuestionDto,
  MapAnswersResultDto,
} from "@/lib/ai/types"

/**
 * Canonicalize question labels for deterministic matching.
 * "Q. 11 (a)" → "11(a)", "11A" → "11a"
 */
export function canonicalizeQuestionLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/^ques(?:tion)?\.?\s*/i, "")
    .replace(/^q\.?\s*/i, "")
    .replace(/\s+/g, "")
    .replace(/[.–—]/g, "-")
}

/**
 * Deterministic first-pass mapping by question label.
 * Answers without a confident label match are left unmatched for an
 * optional LLM second pass (Phase 4).
 */
export function mapAnswersDeterministic(
  questions: ExtractedQuestionDto[],
  answers: ExtractedAnswerDto[]
): MapAnswersResultDto {
  const questionByCanon = new Map<string, ExtractedQuestionDto>()
  for (const q of questions) {
    const key = canonicalizeQuestionLabel(q.number)
    if (key && !questionByCanon.has(key)) {
      questionByCanon.set(key, q)
    }
  }

  const usedQuestionNumbers = new Set<string>()
  const mappings: MapAnswersResultDto["mappings"] = []
  const unmatchedAnswerIndexes: number[] = []

  answers.forEach((answer, answerIndex) => {
    const label = answer.questionLabel?.trim()
    if (!label) {
      mappings.push({
        answerIndex,
        questionNumber: null,
        confidence: 0,
      })
      unmatchedAnswerIndexes.push(answerIndex)
      return
    }

    const key = canonicalizeQuestionLabel(label)
    const match = questionByCanon.get(key)

    if (!match || usedQuestionNumbers.has(match.number)) {
      mappings.push({
        answerIndex,
        questionNumber: null,
        confidence: match ? 0.3 : 0,
      })
      unmatchedAnswerIndexes.push(answerIndex)
      return
    }

    usedQuestionNumbers.add(match.number)
    mappings.push({
      answerIndex,
      questionNumber: match.number,
      confidence: 0.95,
    })
  })

  const unansweredQuestionNumbers = questions
    .map((q) => q.number)
    .filter((number) => !usedQuestionNumbers.has(number))

  return {
    mappings,
    unansweredQuestionNumbers,
    unmatchedAnswerIndexes,
  }
}

/**
 * Merge LLM mapping over a deterministic base.
 * Prefer LLM questionNumber when present and valid; otherwise keep base.
 */
export function mergeAnswerMappings(
  base: MapAnswersResultDto,
  llm: MapAnswersResultDto | null | undefined,
  validQuestionNumbers: Set<string>,
  answerCount: number
): MapAnswersResultDto {
  if (!llm) return base

  const byIndex = new Map(
    base.mappings.map((m) => [m.answerIndex, { ...m }])
  )

  for (const mapping of llm.mappings) {
    if (
      !Number.isInteger(mapping.answerIndex) ||
      mapping.answerIndex < 0 ||
      mapping.answerIndex >= answerCount
    ) {
      continue
    }

    const questionNumber =
      mapping.questionNumber &&
      validQuestionNumbers.has(mapping.questionNumber)
        ? mapping.questionNumber
        : null

    byIndex.set(mapping.answerIndex, {
      answerIndex: mapping.answerIndex,
      questionNumber,
      confidence: mapping.confidence ?? null,
    })
  }

  // Enforce one answer per question (first wins by answerIndex order).
  const claimed = new Set<string>()
  const mappings = [...byIndex.values()]
    .sort((a, b) => a.answerIndex - b.answerIndex)
    .map((m) => {
      if (!m.questionNumber) return m
      if (claimed.has(m.questionNumber)) {
        return { ...m, questionNumber: null, confidence: 0 }
      }
      claimed.add(m.questionNumber)
      return m
    })

  const matchedQuestions = new Set(
    mappings
      .map((m) => m.questionNumber)
      .filter((n): n is string => Boolean(n))
  )

  const unmatchedAnswerIndexes = mappings
    .filter((m) => !m.questionNumber)
    .map((m) => m.answerIndex)

  const unansweredQuestionNumbers = [...validQuestionNumbers].filter(
    (n) => !matchedQuestions.has(n)
  )

  return {
    mappings,
    unansweredQuestionNumbers,
    unmatchedAnswerIndexes,
  }
}
