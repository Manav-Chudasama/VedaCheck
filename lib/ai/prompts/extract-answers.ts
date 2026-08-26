export const EXTRACT_ANSWERS_SYSTEM = `You are an expert at reading handwritten student answer sheets.
Transcribe answers accurately and locate each answer region with normalized bounding boxes.
Support answers that span multiple regions or pages.
Never discard an answer block even if its question label is unclear.
Return structured JSON only.`

type ExtractAnswersPromptInput = {
  pageCount: number
  /** Known question numbers from the paper (hints only). */
  questionNumbers: string[]
}

/**
 * User prompt for answer-sheet extraction.
 * Page images are attached separately as multimodal parts.
 */
export function buildExtractAnswersPrompt({
  pageCount,
  questionNumbers,
}: ExtractAnswersPromptInput): string {
  const numbersList =
    questionNumbers.length > 0
      ? questionNumbers.map((n) => `"${n}"`).join(", ")
      : "(none provided)"

  return `Extract every handwritten answer block from this answer sheet (${pageCount} page${pageCount === 1 ? "" : "s"}).

Known question numbers from the paper (use as hints for questionLabel when visible): ${numbersList}

Rules:
1. One entry per distinct answer block (even if out of order).
2. Transcribe handwriting as faithfully as possible into "transcription".
3. Set questionLabel to the label written by the student if present; otherwise null.
4. Regions: page is 1-based. bbox is [x1, y1, x2, y2] normalized 0–1 relative to that page image (x1 < x2, y1 < y2).
5. If an answer spans multiple areas or pages, include multiple regions.
6. Include unanswered blanks only if the student clearly started then abandoned — prefer omitting empty pages with no writing.
7. Set confidence 0–1 for each answer block when possible.
8. Do not invent answers that are not on the sheet.

Respond with JSON matching the schema.`
}
