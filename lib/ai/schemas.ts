import { z } from "zod"

import type {
  ExtractAnswersResultDto,
  ExtractQuestionsResultDto,
  GradeAnswersResultDto,
  MapAnswersResultDto,
} from "@/lib/ai/types"

/** Normalized bbox [x1, y1, x2, y2] in 0–1. Raw shape only — geometry validated later. */
export const bboxSchema = z
  .tuple([z.number(), z.number(), z.number(), z.number()])
  .describe("Normalized bounding box [x1, y1, x2, y2] in 0–1 page coordinates")

export const answerRegionSchema = z.object({
  page: z
    .number()
    .int()
    .positive()
    .describe("1-based page number on the answer sheet"),
  bbox: bboxSchema,
})

export const extractedQuestionSchema = z.object({
  number: z
    .string()
    .min(1)
    .describe('Exact printed question label, e.g. "1", "11(a)", "Q2"'),
  text: z.string().min(1).describe("Full question text as printed"),
  order: z
    .number()
    .int()
    .nonnegative()
    .describe("0-based index in printed order"),
  maxScore: z
    .number()
    .nonnegative()
    .nullable()
    .optional()
    .describe("Marks for this question if printed; otherwise null"),
})

export const extractQuestionsResultSchema = z.object({
  questions: z.array(extractedQuestionSchema),
})

export const extractedAnswerSchema = z.object({
  questionLabel: z
    .string()
    .nullable()
    .describe(
      "Question label written by the student if visible; null if absent"
    ),
  transcription: z
    .string()
    .describe("Full handwritten answer transcription for this block"),
  regions: z
    .array(answerRegionSchema)
    .min(1)
    .describe("One or more page regions covering this answer"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .nullable()
    .optional()
    .describe("Model confidence 0–1 for this answer block"),
})

export const extractAnswersResultSchema = z.object({
  answers: z.array(extractedAnswerSchema),
})

export const mappedAnswerSchema = z.object({
  answerIndex: z
    .number()
    .int()
    .nonnegative()
    .describe("Index into the extracted answers array"),
  questionNumber: z
    .string()
    .nullable()
    .describe("Matching question number string, or null if unmatched"),
  confidence: z.number().min(0).max(1).nullable().optional(),
})

export const mapAnswersResultSchema = z.object({
  mappings: z.array(mappedAnswerSchema),
  unansweredQuestionNumbers: z
    .array(z.string())
    .describe("Question numbers with no student answer"),
  unmatchedAnswerIndexes: z
    .array(z.number().int().nonnegative())
    .describe("Answer indexes that match no question"),
})

export const gradedAnswerSchema = z.object({
  questionNumber: z.string().min(1),
  score: z.number().nonnegative(),
  maxScore: z.number().positive(),
  feedback: z.string().describe("Brief teacher-facing feedback"),
})

export const gradeAnswersResultSchema = z.object({
  grades: z.array(gradedAnswerSchema),
  overallFeedback: z.string().nullable().optional(),
})

export type ExtractQuestionsResult = z.infer<
  typeof extractQuestionsResultSchema
> &
  ExtractQuestionsResultDto

export type ExtractAnswersResult = z.infer<typeof extractAnswersResultSchema> &
  ExtractAnswersResultDto

export type MapAnswersResult = z.infer<typeof mapAnswersResultSchema> &
  MapAnswersResultDto

export type GradeAnswersResult = z.infer<typeof gradeAnswersResultSchema> &
  GradeAnswersResultDto

/**
 * Convert a Zod schema to a JSON Schema object suitable for Gemini
 * `responseJsonSchema` (strips draft `$schema` meta).
 */
export function zodToGeminiJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>
  const { $schema: _schema, ...rest } = jsonSchema
  return rest
}
