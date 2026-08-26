import {
  createPartFromBase64,
  GoogleGenAI,
  type ContentListUnion,
  type Part,
} from "@google/genai"
import type { z } from "zod"

import {
  GeminiApiError,
  GeminiConfigError,
  GeminiEmptyResponseError,
  GeminiInvalidJsonError,
  GeminiSchemaValidationError,
} from "@/lib/ai/errors"
import { zodToGeminiJsonSchema } from "@/lib/ai/schemas"
import type { GeminiImagePart } from "@/lib/ai/types"

/** Default vision/text model — free-tier friendly; override with GEMINI_MODEL. */
export const DEFAULT_GEMINI_MODEL = "gemini-3.1-pro-preview"

let client: GoogleGenAI | null = null

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (!key) {
    throw new GeminiConfigError()
  }
  return key
}

/** Lazily create a server-only Gemini client. Never import from client components. */
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: getApiKey() })
  }
  return client
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL
}

/** Build an inline image Part from bytes or base64. */
export function toGeminiImagePart(image: GeminiImagePart): Part {
  const data =
    typeof image.data === "string"
      ? image.data
      : Buffer.from(image.data).toString("base64")

  return createPartFromBase64(data, image.mimeType)
}

export type GenerateStructuredJsonOptions<T> = {
  /** Zod schema used for responseJsonSchema + runtime validation */
  schema: z.ZodType<T>
  /** Multimodal / text contents for generateContent */
  contents: ContentListUnion
  systemInstruction?: string
  model?: string
  temperature?: number
}

/**
 * Call Gemini with structured JSON output and validate with Zod.
 * Treats all model output as untrusted.
 */
export async function generateStructuredJson<T>({
  schema,
  contents,
  systemInstruction,
  model = getGeminiModel(),
  temperature = 0.2,
}: GenerateStructuredJsonOptions<T>): Promise<T> {
  const ai = getGeminiClient()
  const responseJsonSchema = zodToGeminiJsonSchema(schema)

  let response
  try {
    response = await ai.models.generateContent({
      model,
      contents,
      config: {
        temperature,
        systemInstruction,
        responseMimeType: "application/json",
        responseJsonSchema,
      },
    })
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status: unknown }).status)
        : undefined
    const message =
      error instanceof Error ? error.message : "Gemini API request failed"
    throw new GeminiApiError(message, Number.isFinite(status) ? status : undefined, {
      cause: error,
    })
  }

  const text = response.text?.trim()
  if (!text) {
    throw new GeminiEmptyResponseError()
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text) as unknown
  } catch {
    throw new GeminiInvalidJsonError("Gemini response was not valid JSON", text)
  }

  const result = schema.safeParse(parsed)
  if (!result.success) {
    throw new GeminiSchemaValidationError(
      "Gemini response failed schema validation",
      result.error.issues
    )
  }

  return result.data
}

/**
 * Convenience: text prompt + page images → structured JSON.
 * Images are appended after the text instruction.
 */
export async function generateStructuredJsonFromImages<T>(options: {
  schema: z.ZodType<T>
  prompt: string
  images: GeminiImagePart[]
  systemInstruction?: string
  model?: string
  temperature?: number
}): Promise<T> {
  const parts: Part[] = [
    { text: options.prompt },
    ...options.images.map(toGeminiImagePart),
  ]

  return generateStructuredJson({
    schema: options.schema,
    contents: parts,
    systemInstruction: options.systemInstruction,
    model: options.model,
    temperature: options.temperature,
  })
}
