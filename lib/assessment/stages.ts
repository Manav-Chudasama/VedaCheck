/** Pipeline processing stages and UI-facing progress. */

export const PROCESSING_STAGES = [
  "uploading",
  "reading",
  "extracting_questions",
  "reading_answers",
  "mapping",
  "grading",
  "ready",
  "failed",
] as const

export type ProcessingStage = (typeof PROCESSING_STAGES)[number]

/** Progress percent (0–100) when a stage begins / completes. */
export const STAGE_PROGRESS: Record<ProcessingStage, number> = {
  uploading: 5,
  reading: 15,
  extracting_questions: 35,
  reading_answers: 55,
  mapping: 75,
  grading: 88,
  ready: 100,
  failed: 0,
}

/** User-facing copy aligned with AGENTS.md §5.2. */
export const STAGE_LABELS: Record<ProcessingStage, string> = {
  uploading: "Uploading",
  reading: "Reading documents",
  extracting_questions: "Extracting questions",
  reading_answers: "Reading handwritten answers",
  mapping: "Mapping answers",
  grading: "Preparing assessment",
  ready: "Preparing assessment",
  failed: "Processing failed",
}

export function isTerminalStage(stage: ProcessingStage): boolean {
  return stage === "ready" || stage === "failed"
}
