import type {
  ExtractAnswersResultDto,
  ExtractQuestionsResultDto,
  GradeAnswersResultDto,
  MapAnswersResultDto,
} from "@/lib/ai/types"
import {
  mapAnswersDeterministic,
  mergeAnswerMappings,
} from "@/lib/assessment/map-answers"
import { normalizeQuestionsAndGroups } from "@/lib/assessment/normalize-groups"
import { normalizeAssessment } from "@/lib/assessment/normalize"
import { setJobStage, updateAssessmentJob, getAssessmentJob } from "@/lib/assessment/store"
import type { PageRaster } from "@/lib/documents/types"
import { rasterizeDocument } from "@/lib/documents/rasterize"

export type PipelineDocument = {
  data: Buffer | Uint8Array
  mimeType: string
  fileName?: string
}

export type PipelineAiDeps = {
  extractQuestions: (
    pages: PageRaster[]
  ) => Promise<ExtractQuestionsResultDto>
  extractAnswers: (
    pages: PageRaster[],
    questionNumbers: string[]
  ) => Promise<ExtractAnswersResultDto>
  /**
   * Optional LLM second-pass for ambiguous / label-less answers.
   * Deterministic label matching always runs first.
   */
  mapAnswers?: (
    questions: ExtractQuestionsResultDto["questions"],
    answers: ExtractAnswersResultDto["answers"]
  ) => Promise<MapAnswersResultDto>
  gradeAnswers?: (input: {
    pairs: Array<{
      questionNumber: string
      questionText: string
      maxScore: number
      transcription: string
    }>
    /** Optional page images covering answer regions for vision grading */
    images?: PageRaster[]
  }) => Promise<GradeAnswersResultDto>
}

export type RunAssessmentPipelineOptions = {
  questionPaper: PipelineDocument
  answerSheet: PipelineDocument
  ai: PipelineAiDeps
  /** Default true — set false to skip grading stage. */
  enableGrading?: boolean
}

/**
 * Run the full assessment pipeline, updating job stage/progress as it goes.
 * AI extractors are injected so providers can be swapped without changing this flow.
 */
export async function runAssessmentPipeline(
  jobId: string,
  options: RunAssessmentPipelineOptions
): Promise<void> {
  const job = getAssessmentJob(jobId)
  if (!job) {
    throw new Error(`Assessment job not found: ${jobId}`)
  }

  const enableGrading = options.enableGrading !== false

  try {
    // --- reading documents ---
    setJobStage(jobId, "reading")

    const [questionPaperPages, answerSheetPages] = await Promise.all([
      rasterizeDocument({
        data: options.questionPaper.data,
        mimeType: options.questionPaper.mimeType,
        fileName: options.questionPaper.fileName,
      }),
      rasterizeDocument({
        data: options.answerSheet.data,
        mimeType: options.answerSheet.mimeType,
        fileName: options.answerSheet.fileName,
      }),
    ])

    updateAssessmentJob(jobId, {
      questionPaperPages,
      answerSheetPages,
    })

    // --- extract questions ---
    setJobStage(jobId, "extracting_questions")
    const extractedQuestions = await options.ai.extractQuestions(
      questionPaperPages
    )

    const { questions: derivedQuestions } = normalizeQuestionsAndGroups({
      questions: extractedQuestions.questions,
      groups: extractedQuestions.groups ?? [],
    })
    const maxScoreByNumber = new Map(
      derivedQuestions.map((q) => [q.number, q.maxScore])
    )

    // --- extract answers ---
    setJobStage(jobId, "reading_answers")
    const questionNumbers = extractedQuestions.questions.map((q) => q.number)
    const extractedAnswers = await options.ai.extractAnswers(
      answerSheetPages,
      questionNumbers
    )

    // --- mapping ---
    setJobStage(jobId, "mapping")
    const deterministic = mapAnswersDeterministic(
      extractedQuestions.questions,
      extractedAnswers.answers
    )

    let llmMapping: MapAnswersResultDto | undefined
    if (options.ai.mapAnswers) {
      llmMapping = await options.ai.mapAnswers(
        extractedQuestions.questions,
        extractedAnswers.answers
      )
    }

    const validNumbers = new Set(
      extractedQuestions.questions.map((q) => q.number)
    )
    const mapping = mergeAnswerMappings(
      deterministic,
      llmMapping,
      validNumbers,
      extractedAnswers.answers.length
    )

    // --- optional grading ---
    let grades: GradeAnswersResultDto | null = null
    if (enableGrading && options.ai.gradeAnswers) {
      setJobStage(jobId, "grading")

      const pairs = mapping.mappings
        .filter((m) => m.questionNumber)
        .map((m) => {
          const question = extractedQuestions.questions.find(
            (q) => q.number === m.questionNumber
          )
          const answer = extractedAnswers.answers[m.answerIndex]
          if (!question || !answer) return null

          const derived = maxScoreByNumber.get(question.number)
          const explicit =
            question.maxScore && question.maxScore > 0
              ? question.maxScore
              : undefined
          const maxScore =
            explicit ??
            (derived && derived > 0 ? derived : undefined)

          // Skip grading when marks are still unknown rather than inventing 1.
          if (maxScore === undefined) return null

          return {
            questionNumber: question.number,
            questionText: question.text,
            maxScore,
            transcription: answer.transcription,
          }
        })
        .filter((p): p is NonNullable<typeof p> => p !== null)

      if (pairs.length > 0) {
        // Pages referenced by graded answers — helps vision verify handwriting.
        const pageSet = new Set<number>()
        for (const m of mapping.mappings) {
          if (!m.questionNumber) continue
          const answer = extractedAnswers.answers[m.answerIndex]
          for (const region of answer?.regions ?? []) {
            if (Number.isInteger(region.page)) pageSet.add(region.page)
          }
        }
        const images = answerSheetPages.filter((p) => pageSet.has(p.page))

        grades = await options.ai.gradeAnswers({ pairs, images })
      }
    }

    const result = normalizeAssessment({
      assessmentId: jobId,
      questions: extractedQuestions.questions,
      groups: extractedQuestions.groups ?? [],
      totalMarks: extractedQuestions.totalMarks,
      answers: extractedAnswers.answers,
      mapping,
      answerSheetPages,
      grades,
    })

    updateAssessmentJob(jobId, {
      stage: "ready",
      result,
      overallFeedback: grades?.overallFeedback ?? undefined,
      error: undefined,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Assessment pipeline failed"
    setJobStage(jobId, "failed", message)
    throw error
  }
}
