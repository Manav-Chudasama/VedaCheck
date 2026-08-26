/**
 * Server-only OpenAI AI layer.
 * Do not import from client components — keeps OPENAI_API_KEY off the browser bundle.
 */

export {
  DEFAULT_OPENAI_MODEL,
  generateStructuredJson,
  generateStructuredJsonFromImages,
  getOpenAiClient,
  getOpenAiModel,
  toDataUrl,
} from "@/lib/ai/openai"

export {
  AiApiError,
  AiConfigError,
  AiEmptyResponseError,
  AiInvalidJsonError,
  AiSchemaValidationError,
} from "@/lib/ai/errors"

export {
  answerRegionSchema,
  bboxSchema,
  extractAnswersResultSchema,
  extractedAnswerSchema,
  extractedQuestionSchema,
  extractQuestionsResultSchema,
  gradeAnswersResultSchema,
  gradedAnswerSchema,
  mapAnswersResultSchema,
  mappedAnswerSchema,
  zodToJsonSchema,
} from "@/lib/ai/schemas"

export { pageRastersToAiImages } from "@/lib/ai/page-images"
export { extractQuestionsFromPages } from "@/lib/ai/extract-questions"
export { extractAnswersFromPages } from "@/lib/ai/extract-answers"
export { mapAnswersWithOpenAi } from "@/lib/ai/map-answers"
export { gradeAnswersWithOpenAi } from "@/lib/ai/grade-answers"
export {
  createOpenAiPipelineAiDeps,
  type CreateOpenAiPipelineAiDepsOptions,
} from "@/lib/ai/pipeline-deps"
export {
  runOpenAiAssessmentPipeline,
  type RunOpenAiAssessmentOptions,
} from "@/lib/ai/run-pipeline"

export type {
  AiImagePart,
  AnswerRegionDto,
  BBoxDto,
  ExtractAnswersResultDto,
  ExtractedAnswerDto,
  ExtractedQuestionDto,
  ExtractQuestionsResultDto,
  GradeAnswersResultDto,
  GradedAnswerDto,
  MapAnswersResultDto,
  MappedAnswerDto,
} from "@/lib/ai/types"
