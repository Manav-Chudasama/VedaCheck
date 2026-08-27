import { createOpenAiPipelineAiDeps } from "@/lib/ai/pipeline-deps"
import {
  runAssessmentPipeline,
  type PipelineDocumentInput,
  type RunAssessmentPipelineOptions,
} from "@/lib/assessment/pipeline"

export type RunOpenAiAssessmentOptions = {
  questionPaper: PipelineDocumentInput
  answerSheet: PipelineDocumentInput
  enableGrading?: boolean
  enableLlmMapping?: boolean
  onlyWhenAmbiguous?: boolean
}

/**
 * Run the assessment pipeline with the default OpenAI-backed AI deps.
 */
export async function runOpenAiAssessmentPipeline(
  jobId: string,
  options: RunOpenAiAssessmentOptions
): Promise<void> {
  const ai = createOpenAiPipelineAiDeps({
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
