import type {
  ExtractedAnswerDto,
  ExtractedQuestionDto,
  GradeAnswersResultDto,
  MapAnswersResultDto,
} from "@/lib/ai/types"
import { normalizeAnswerRegions, type PageSize } from "@/lib/assessment/bbox"
import { toAnswerSheetPages } from "@/lib/assessment/to-answer-sheet-pages"
import type {
  AssessmentItem,
  AssessmentViewModel,
  Question,
  StudentAnswer,
} from "@/lib/assessment/types"
import type { PageRaster } from "@/lib/documents/types"

export type NormalizeAssessmentInput = {
  assessmentId: string
  questions: ExtractedQuestionDto[]
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

/**
 * Sort + dedupe extracted questions into domain Question records.
 * Preserves first occurrence of each question number; sorts by `order`.
 */
export function normalizeQuestions(
  questions: ExtractedQuestionDto[]
): Question[] {
  const seen = new Set<string>()
  const unique: ExtractedQuestionDto[] = []

  const sorted = [...questions].sort((a, b) => a.order - b.order)

  for (const q of sorted) {
    const number = q.number.trim()
    if (!number || seen.has(number)) continue
    seen.add(number)
    unique.push({ ...q, number, text: q.text.trim() })
  }

  return unique.map((q, index) => ({
    id: `q-${canonicalizeId(q.number)}-${index}`,
    number: q.number,
    text: q.text,
    order: index,
    maxScore:
      q.maxScore === null || q.maxScore === undefined
        ? undefined
        : q.maxScore,
  }))
}

function canonicalizeId(number: string): string {
  return number.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

function buildStudentAnswer(input: {
  questionId: string | null
  answer: ExtractedAnswerDto
  pageSizes: Map<number, PageSize>
  grade?: { score: number; maxScore: number; feedback: string }
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
    maxScore: input.grade?.maxScore,
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
  const questions = normalizeQuestions(input.questions)
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

  const items: AssessmentItem[] = questions.map((question) => {
    const answer = answerByQuestionNumber.get(question.number) ?? null

    if (answer) {
      return { question, answer, status: "answered" as const }
    }

    return { question, answer: null, status: "unanswered" as const }
  })

  return {
    items,
    pages: toAnswerSheetPages(input.assessmentId, input.answerSheetPages),
    unmatchedAnswers,
  }
}
