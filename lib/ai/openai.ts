import OpenAI from "openai"
import { zodResponseFormat } from "openai/helpers/zod"
import type { z } from "zod"

import {
  AiApiError,
  AiConfigError,
  AiEmptyResponseError,
  AiSchemaValidationError,
} from "@/lib/ai/errors"
import type { AiImagePart } from "@/lib/ai/types"

/** Default vision/text model. Override with OPENAI_MODEL. */
export const DEFAULT_OPENAI_MODEL = "gpt-4o"

let client: OpenAI | null = null

function getApiKey(): string {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) {
    throw new AiConfigError()
  }
  return key
}

/** Lazily create a server-only OpenAI client. Never import from client components. */
export function getOpenAiClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: getApiKey() })
  }
  return client
}

export function getOpenAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL
}

export function toDataUrl(image: AiImagePart): string {
  const data =
    typeof image.data === "string"
      ? image.data
      : Buffer.from(image.data).toString("base64")
  return `data:${image.mimeType};base64,${data}`
}

export type GenerateStructuredJsonOptions<T> = {
  schema: z.ZodType<T>
  /** Schema name for OpenAI structured outputs */
  schemaName: string
  systemInstruction?: string
  userText: string
  images?: AiImagePart[]
  model?: string
  temperature?: number
}

/**
 * Call OpenAI with structured JSON output (Zod) and validate the parsed result.
 * Treats all model output as untrusted.
 */
export async function generateStructuredJson<T>({
  schema,
  schemaName,
  systemInstruction,
  userText,
  images = [],
  model = getOpenAiModel(),
  temperature = 0.2,
}: GenerateStructuredJsonOptions<T>): Promise<T> {
  const openai = getOpenAiClient()

  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [
    { type: "text", text: userText },
    ...images.map((image) => ({
      type: "image_url" as const,
      image_url: {
        url: toDataUrl(image),
        detail: "high" as const,
      },
    })),
  ]

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction })
  }
  messages.push({ role: "user", content: userContent })

  let completion
  try {
    completion = await openai.chat.completions.parse({
      model,
      messages,
      temperature,
      response_format: zodResponseFormat(schema, schemaName),
    })
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? Number((error as { status: unknown }).status)
        : undefined
    const message =
      error instanceof Error ? error.message : "OpenAI API request failed"
    throw new AiApiError(message, Number.isFinite(status) ? status : undefined, {
      cause: error,
    })
  }

  const message = completion.choices[0]?.message
  if (message?.refusal) {
    throw new AiApiError(`OpenAI refused the request: ${message.refusal}`)
  }

  const parsed = message?.parsed
  if (parsed == null) {
    const raw = message?.content?.trim()
    if (!raw) throw new AiEmptyResponseError()
    throw new AiSchemaValidationError(
      "OpenAI response failed schema validation",
      raw
    )
  }

  // Defense in depth — SDK already parsed, but re-validate with our schema.
  const result = schema.safeParse(parsed)
  if (!result.success) {
    throw new AiSchemaValidationError(
      "OpenAI response failed schema validation",
      result.error.issues
    )
  }

  return result.data
}

/**
 * Convenience: text prompt + page images → structured JSON.
 */
export async function generateStructuredJsonFromImages<T>(options: {
  schema: z.ZodType<T>
  schemaName: string
  prompt: string
  images: AiImagePart[]
  systemInstruction?: string
  model?: string
  temperature?: number
}): Promise<T> {
  return generateStructuredJson({
    schema: options.schema,
    schemaName: options.schemaName,
    systemInstruction: options.systemInstruction,
    userText: options.prompt,
    images: options.images,
    model: options.model,
    temperature: options.temperature,
  })
}
