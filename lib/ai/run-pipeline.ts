import { createGeminiPipelineAiDeps } from "@/lib/ai/pipeline-deps"
import {
  runAssessmentPipeline,
  type PipelineDocument,
  type RunAssessmentPipelineOptions,
} from "@/lib/assessment/pipeline"

export type RunGeminiAssessmentOptions = {
  questionPaper: PipelineDocument
  answerSheet: PipelineDocument
  enableGrading?: boolean
  enableLlmMapping?: boolean
  onlyWhenAmbiguous?: boolean
}

/**
 * Run the assessment pipeline with the default Gemini-backed AI deps.
 */
export async function runGeminiAssessmentPipeline(
  jobId: string,
  options: RunGeminiAssessmentOptions
): Promise<void> {
  const ai = createGeminiPipelineAiDeps({
    enableGrading: options.enableGrading,
    enableLlmMapping: options.enableLlmMapping,
    onlyWhenAmbiguous: options.onlyWhenAmbiguous,
  })

  const pipelineOptions: RunAssessmentPipelineOptions = {
    questionPaper: options.questionPaper,
    answerSheet: options.answerSheet,
    ai,
    enableGrading: options.enableGrading,
  }

  await runAssessmentPipeline(jobId, pipelineOptions)
}
