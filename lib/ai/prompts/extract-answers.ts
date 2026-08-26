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
2. Transcribe handwriting as faithfully as possible into "transcription" — include the FULL answer text (code, examples, diagrams described in words).
3. Set questionLabel to the label written by the student if present; otherwise null.
4. Regions: page is 1-based. bbox is [x1, y1, x2, y2] normalized 0–1 relative to that page image (x1 < x2, y1 < y2).
5. Answer block boundaries:
   - An answer starts at its label (or the first line of writing for that block).
   - It ENDS at the next question label (e.g. a), b), 2., Q3, 11(a)) OR at the bottom of the page.
   - Do NOT cut mid-sentence or mid-code block. Prefer slightly generous vertical padding over truncating.
   - Do NOT expand into the following question’s stem or answer.
6. Multi-page answers: use MULTIPLE regions — page N remainder + page N+1 continuation (and further pages). Never return a single truncated box when writing continues.
7. Include unanswered blanks only if the student clearly started then abandoned — prefer omitting empty pages with no writing.
8. Set confidence 0–1 for each answer block when possible.
9. Do not invent answers that are not on the sheet.

Respond with JSON matching the schema.`
}
