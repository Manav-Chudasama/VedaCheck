import { generateStructuredJsonFromImages } from "@/lib/ai/gemini"
import { pageRastersToGeminiImages } from "@/lib/ai/page-images"
import {
  EXTRACT_ANSWERS_SYSTEM,
  buildExtractAnswersPrompt,
} from "@/lib/ai/prompts/extract-answers"
import { extractAnswersResultSchema } from "@/lib/ai/schemas"
import type { ExtractAnswersResultDto } from "@/lib/ai/types"
import type { PageRaster } from "@/lib/documents/types"

/**
 * Transcribe handwritten answers and locate bbox regions on answer-sheet pages.
 */
export async function extractAnswersFromPages(
  pages: PageRaster[],
  questionNumbers: string[]
): Promise<ExtractAnswersResultDto> {
  if (pages.length === 0) {
    return { answers: [] }
  }

  return generateStructuredJsonFromImages({
    schema: extractAnswersResultSchema,
    systemInstruction: EXTRACT_ANSWERS_SYSTEM,
    prompt: buildExtractAnswersPrompt({
      pageCount: pages.length,
      questionNumbers,
    }),
    images: pageRastersToGeminiImages(pages),
    temperature: 0.2,
  })
}
