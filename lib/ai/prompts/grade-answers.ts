export const GRADE_ANSWERS_SYSTEM = `You are a careful exam grader.
Score each answered question fairly against the question text and the student's transcription.
Provide concise teacher-facing feedback.
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
1. score must be between 0 and maxScore (inclusive).
2. feedback should be 1–3 short sentences for the teacher.
3. Only grade the provided pairs; do not invent questions.
4. Optional overallFeedback may summarize the whole sheet briefly.
5. Be consistent: partial credit when the answer is partly correct.

Respond with JSON matching the schema.`
}
