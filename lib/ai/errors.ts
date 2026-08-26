/** Structured errors for OpenAI / AI pipeline failures. */

export class AiConfigError extends Error {
  readonly code = "AI_CONFIG" as const

  constructor(message = "OPENAI_API_KEY is not configured") {
    super(message)
    this.name = "AiConfigError"
  }
}

export class AiEmptyResponseError extends Error {
  readonly code = "AI_EMPTY_RESPONSE" as const

  constructor(message = "OpenAI returned an empty response") {
    super(message)
    this.name = "AiEmptyResponseError"
  }
}

export class AiInvalidJsonError extends Error {
  readonly code = "AI_INVALID_JSON" as const

  constructor(
    message = "OpenAI response was not valid JSON",
    readonly raw?: string
  ) {
    super(message)
    this.name = "AiInvalidJsonError"
  }
}

export class AiSchemaValidationError extends Error {
  readonly code = "AI_SCHEMA_VALIDATION" as const

  constructor(
    message = "OpenAI response failed schema validation",
    readonly issues?: unknown
  ) {
    super(message)
    this.name = "AiSchemaValidationError"
  }
}

export class AiApiError extends Error {
  readonly code = "AI_API" as const

  constructor(
    message: string,
    readonly status?: number,
    options?: { cause?: unknown }
  ) {
    super(message, options)
    this.name = "AiApiError"
  }
}
