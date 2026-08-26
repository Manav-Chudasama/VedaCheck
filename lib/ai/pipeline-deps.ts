import { extractAnswersFromPages } from "@/lib/ai/extract-answers"
import { extractQuestionsFromPages } from "@/lib/ai/extract-questions"
import { gradeAnswersWithGemini } from "@/lib/ai/grade-answers"
import { mapAnswersWithGemini } from "@/lib/ai/map-answers"
import type { PipelineAiDeps } from "@/lib/assessment/pipeline"
import { mapAnswersDeterministic } from "@/lib/assessment/map-answers"

export type CreateGeminiPipelineAiDepsOptions = {
  /**
   * When true (default), run an LLM mapping pass.
   * If `onlyWhenAmbiguous` is also true, LLM runs only when deterministic
   * matching left unanswered questions or unmatched answers.
   */
  enableLlmMapping?: boolean
  /** Default true — skip LLM map when every answer matched by label. */
  onlyWhenAmbiguous?: boolean
  /** Default true — include grading stage. */
  enableGrading?: boolean
}

/**
 * Build PipelineAiDeps backed by Gemini structured-output calls.
 * Server-only — requires GEMINI_API_KEY.
 */
export function createGeminiPipelineAiDeps(
  options: CreateGeminiPipelineAiDepsOptions = {}
): PipelineAiDeps {
  const enableLlmMapping = options.enableLlmMapping !== false
  const onlyWhenAmbiguous = options.onlyWhenAmbiguous !== false
  const enableGrading = options.enableGrading !== false

  return {
    extractQuestions: extractQuestionsFromPages,
    extractAnswers: extractAnswersFromPages,
    mapAnswers: enableLlmMapping
      ? async (questions, answers) => {
          if (onlyWhenAmbiguous) {
            const deterministic = mapAnswersDeterministic(questions, answers)
            const needsLlm =
              deterministic.unmatchedAnswerIndexes.length > 0 ||
              deterministic.unansweredQuestionNumbers.length > 0
            if (!needsLlm) {
              return deterministic
            }
          }
          return mapAnswersWithGemini(questions, answers)
        }
      : undefined,
    gradeAnswers: enableGrading ? gradeAnswersWithGemini : undefined,
  }
}
