import { generateStructuredJson } from "@/lib/ai/openai"
import {
  MAP_ANSWERS_SYSTEM,
  buildMapAnswersPrompt,
} from "@/lib/ai/prompts/map-answers"
import { mapAnswersResultSchema } from "@/lib/ai/schemas"
import type {
  ExtractedAnswerDto,
  ExtractedQuestionDto,
  MapAnswersResultDto,
} from "@/lib/ai/types"

const TRANSCRIPTION_PREVIEW_CHARS = 400

/**
 * LLM second-pass mapping for ambiguous / label-less answers.
 * Text-only (no images) — uses question text + answer transcriptions.
 */
export async function mapAnswersWithOpenAi(
  questions: ExtractedQuestionDto[],
  answers: ExtractedAnswerDto[]
): Promise<MapAnswersResultDto> {
  if (answers.length === 0) {
    return {
      mappings: [],
      unansweredQuestionNumbers: questions.map((q) => q.number),
      unmatchedAnswerIndexes: [],
    }
  }

  const promptAnswers = answers.map((answer, index) => ({
    index,
    questionLabel: answer.questionLabel,
    transcription: truncate(answer.transcription, TRANSCRIPTION_PREVIEW_CHARS),
  }))

  return generateStructuredJson({
    schema: mapAnswersResultSchema,
    schemaName: "map_answers",
    systemInstruction: MAP_ANSWERS_SYSTEM,
    userText: buildMapAnswersPrompt({
      questions: questions.map((q) => ({
        number: q.number,
        text: truncate(q.text, 500),
      })),
      answers: promptAnswers,
    }),
    temperature: 0.1,
  })
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}…`
}
