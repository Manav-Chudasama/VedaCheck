import type {
  ExtractedAnswerDto,
  ExtractedQuestionDto,
  ExtractedQuestionGroupDto,
  GradeAnswersResultDto,
  MapAnswersResultDto,
} from "@/lib/ai/types"
import { applyAttemptRules } from "@/lib/assessment/apply-attempt-rules"
import { normalizeAnswerRegions, type PageSize } from "@/lib/assessment/bbox"
import { refineOverlappingAnswerRegions } from "@/lib/assessment/bbox-refine"
import { normalizeQuestionsAndGroups } from "@/lib/assessment/normalize-groups"
import { toAnswerSheetPages } from "@/lib/assessment/to-answer-sheet-pages"
import type {
  AssessmentItem,
  AssessmentViewModel,
  StudentAnswer,
} from "@/lib/assessment/types"
import type { PageRaster } from "@/lib/documents/types"

export type NormalizeAssessmentInput = {
  assessmentId: string
  questions: ExtractedQuestionDto[]
  groups?: ExtractedQuestionGroupDto[]
  totalMarks?: number | null
  answers: ExtractedAnswerDto[]
  mapping: MapAnswersResultDto
  answerSheetPages: PageRaster[]
  grades?: GradeAnswersResultDto | null
}

function buildPageSizeMap(pages: PageRaster[]): Map<number, PageSize> {
  const map = new Map<number, PageSize>()
  for (const page of pages) {
    map.set(page.page, { width: page.width, height: page.height })
  }
  return map
}

function buildStudentAnswer(input: {
  questionId: string | null
  answer: ExtractedAnswerDto
  pageSizes: Map<number, PageSize>
  grade?: { score: number; maxScore: number; feedback: string }
  fallbackMaxScore?: number
}): StudentAnswer | null {
  const regions = normalizeAnswerRegions(input.answer.regions, input.pageSizes)
  const transcription = input.answer.transcription.trim()

  // Unmatched answers may still be useful even with empty regions.
  if (!transcription && regions.length === 0) return null

  return {
    questionId: input.questionId,
    transcription,
    regions,
    confidence: input.answer.confidence ?? undefined,
    score: input.grade?.score,
    maxScore: input.grade?.maxScore ?? input.fallbackMaxScore,
    feedback: input.grade?.feedback,
  }
}

/**
 * Deterministically assemble AssessmentViewModel from AI DTOs + page rasters.
 * LLM output is treated as untrusted — bboxes validated, ids assigned here.
 */
export function normalizeAssessment(
  input: NormalizeAssessmentInput
): AssessmentViewModel {
  const { questions, groups } = normalizeQuestionsAndGroups({
    questions: input.questions,
    groups: input.groups ?? [],
  })
  const pageSizes = buildPageSizeMap(input.answerSheetPages)
  const questionByNumber = new Map(questions.map((q) => [q.number, q]))

  const gradeByNumber = new Map(
    (input.grades?.grades ?? []).map((g) => [g.questionNumber, g])
  )

  const mappingByAnswerIndex = new Map(
    input.mapping.mappings.map((m) => [m.answerIndex, m])
  )

  const answerByQuestionNumber = new Map<string, StudentAnswer>()
  const unmatchedAnswers: StudentAnswer[] = []

  input.answers.forEach((rawAnswer, answerIndex) => {
    const mapping = mappingByAnswerIndex.get(answerIndex)
    const questionNumber = mapping?.questionNumber ?? null
    const question = questionNumber
      ? questionByNumber.get(questionNumber)
      : undefined

    const grade = questionNumber
      ? gradeByNumber.get(questionNumber)
      : undefined

    const studentAnswer = buildStudentAnswer({
      questionId: question?.id ?? null,
      answer: rawAnswer,
      pageSizes,
      grade: grade
        ? {
            score: grade.score,
            maxScore: grade.maxScore,
            feedback: grade.feedback,
          }
        : undefined,
      fallbackMaxScore: question?.maxScore,
    })

    if (!studentAnswer) return

    if (question) {
      // First mapped answer wins if duplicates slip through.
      if (!answerByQuestionNumber.has(question.number)) {
        answerByQuestionNumber.set(question.number, studentAnswer)
      }
    } else {
      unmatchedAnswers.push(studentAnswer)
    }
  })

  // Shrink heavily overlapping mapped/unmatched regions on the same page.
  const refineTargets = [
    ...answerByQuestionNumber.values(),
    ...unmatchedAnswers,
  ]
  const refined = refineOverlappingAnswerRegions(refineTargets)
  refineTargets.forEach((answer, index) => {
    answer.regions = refined[index]?.regions ?? answer.regions
  })

  const items: AssessmentItem[] = questions.map((question) => {
    const answer = answerByQuestionNumber.get(question.number) ?? null

    if (answer) {
      // Prefer derived question maxScore on the answer when grade omitted it.
      if (
        answer.maxScore === undefined &&
        question.maxScore !== undefined
      ) {
        answer.maxScore = question.maxScore
      }
      return { question, answer, status: "answered" as const }
    }

    return { question, answer: null, status: "unanswered" as const }
  })

  const { items: scoredItems, summary } = applyAttemptRules({
    items,
    groups,
    paperMaxScore: input.totalMarks,
  })

  return {
    items: scoredItems,
    groups,
    pages: toAnswerSheetPages(input.assessmentId, input.answerSheetPages),
    unmatchedAnswers,
    summary,
  }
}

/**
 * Sort + dedupe extracted questions (no groups). Kept for unit tests / callers
 * that only need the flat question list.
 */
export function normalizeQuestions(
  questions: ExtractedQuestionDto[]
): ReturnType<typeof normalizeQuestionsAndGroups>["questions"] {
  return normalizeQuestionsAndGroups({ questions, groups: [] }).questions
}
