export const MAP_ANSWERS_SYSTEM = `You map student answer blocks to exam questions.
Prefer exact label matches. Handle out-of-order answers.
Flag unanswered questions and unmatched answers explicitly — never drop them silently.
Return structured JSON only.`

type MapAnswersPromptInput = {
  questions: Array<{ number: string; text: string }>
  answers: Array<{
    index: number
    questionLabel: string | null
    transcription: string
  }>
}

/**
 * User prompt for answer → question mapping (text-only; no images required).
 */
export function buildMapAnswersPrompt({
  questions,
  answers,
}: MapAnswersPromptInput): string {
  return `Map each extracted student answer to a question from the paper.

Questions (number + text):
${JSON.stringify(questions, null, 2)}

Answers (index, questionLabel, transcription preview):
${JSON.stringify(answers, null, 2)}

Rules:
1. Prefer matching by questionLabel when it clearly matches a question number (including sub-parts like 11(a)).
2. If the label is missing or ambiguous, use semantic similarity of the transcription to the question text.
3. Each answer maps to at most one question. Each question should receive at most one primary answer.
4. Populate unansweredQuestionNumbers with every question number that has no mapped answer.
5. Populate unmatchedAnswerIndexes with every answer index that matches no question.
6. Include a mapping entry for every answer (questionNumber null when unmatched).
7. Do not invent question numbers that are not in the list.

Respond with JSON matching the schema.`
}
