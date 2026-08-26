/** Structured errors for Gemini / AI pipeline failures. */

export class GeminiConfigError extends Error {
  readonly code = "GEMINI_CONFIG" as const

  constructor(message = "GEMINI_API_KEY is not configured") {
    super(message)
    this.name = "GeminiConfigError"
  }
}

export class GeminiEmptyResponseError extends Error {
  readonly code = "GEMINI_EMPTY_RESPONSE" as const

  constructor(message = "Gemini returned an empty response") {
    super(message)
    this.name = "GeminiEmptyResponseError"
  }
}

export class GeminiInvalidJsonError extends Error {
  readonly code = "GEMINI_INVALID_JSON" as const

  constructor(
    message = "Gemini response was not valid JSON",
    readonly raw?: string
  ) {
    super(message)
    this.name = "GeminiInvalidJsonError"
  }
}

export class GeminiSchemaValidationError extends Error {
  readonly code = "GEMINI_SCHEMA_VALIDATION" as const

  constructor(
    message = "Gemini response failed schema validation",
    readonly issues?: unknown
  ) {
    super(message)
    this.name = "GeminiSchemaValidationError"
  }
}

export class GeminiApiError extends Error {
  readonly code = "GEMINI_API" as const

  constructor(
    message: string,
    readonly status?: number,
    options?: { cause?: unknown }
  ) {
    super(message, options)
    this.name = "GeminiApiError"
  }
}
