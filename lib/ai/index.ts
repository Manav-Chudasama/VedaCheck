/**
 * Server-only Gemini AI layer.
 * Do not import from client components — keeps GEMINI_API_KEY off the browser bundle.
 */

export {
  DEFAULT_GEMINI_MODEL,
  generateStructuredJson,
  generateStructuredJsonFromImages,
  getGeminiClient,
  getGeminiModel,
  toGeminiImagePart,
} from "@/lib/ai/gemini"

export {
  GeminiApiError,
  GeminiConfigError,
  GeminiEmptyResponseError,
  GeminiInvalidJsonError,
  GeminiSchemaValidationError,
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
  zodToGeminiJsonSchema,
} from "@/lib/ai/schemas"

export { pageRastersToGeminiImages } from "@/lib/ai/page-images"
export { extractQuestionsFromPages } from "@/lib/ai/extract-questions"
export { extractAnswersFromPages } from "@/lib/ai/extract-answers"
export { mapAnswersWithGemini } from "@/lib/ai/map-answers"
export { gradeAnswersWithGemini } from "@/lib/ai/grade-answers"
export {
  createGeminiPipelineAiDeps,
  type CreateGeminiPipelineAiDepsOptions,
} from "@/lib/ai/pipeline-deps"
export {
  runGeminiAssessmentPipeline,
  type RunGeminiAssessmentOptions,
} from "@/lib/ai/run-pipeline"

export type {
  AnswerRegionDto,
  BBoxDto,
  ExtractAnswersResultDto,
  ExtractedAnswerDto,
  ExtractedQuestionDto,
  ExtractQuestionsResultDto,
  GeminiImagePart,
  GradeAnswersResultDto,
  GradedAnswerDto,
  MapAnswersResultDto,
  MappedAnswerDto,
} from "@/lib/ai/types"
