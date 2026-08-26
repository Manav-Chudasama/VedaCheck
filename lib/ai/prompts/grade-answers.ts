export const GRADE_ANSWERS_SYSTEM = `You are a careful exam grader.
Score each answered question fairly against the question text and the student's transcription (and any answer-sheet images provided).
Provide concise teacher-facing feedback.
Do not invent missing content — only penalize what is actually absent from the student's work.
Return structured JSON only.`

type GradeAnswersPromptInput = {
  pairs: Array<{
    questionNumber: string
    questionText: string
    maxScore: number
    transcription: string
  }>
}

/**
 * User prompt for optional per-question grading + feedback.
 */
export function buildGradeAnswersPrompt({
  pairs,
}: GradeAnswersPromptInput): string {
  return `Grade each student answer against its question.

Pairs:
${JSON.stringify(pairs, null, 2)}

Rules:
1. score must be between 0 and maxScore (inclusive). Use the provided maxScore for each pair.
2. feedback should be 1–3 short sentences for the teacher.
3. Only grade the provided pairs; do not invent questions.
4. Optional overallFeedback may summarize the whole sheet briefly.
5. "Any N" / "any two" / "attempt any" wording in the question:
   - If the student provides at least N correct items with adequate explanation → award full marks.
   - Extra items beyond N are fine and must NOT reduce the score.
6. Only award partial credit when a required element is actually absent or wrong in the transcription (or visible on the answer image). Do not claim something is missing if it appears in the transcription.
7. Prefer the full transcription over assumptions. If images of the answer regions are attached, use them to verify handwriting that may be truncated in text.

Respond with JSON matching the schema.`
}
