import { generateStructuredJsonFromImages } from "@/lib/ai/gemini"
import { pageRastersToGeminiImages } from "@/lib/ai/page-images"
import {
  EXTRACT_QUESTIONS_SYSTEM,
  buildExtractQuestionsPrompt,
} from "@/lib/ai/prompts/extract-questions"
import { extractQuestionsResultSchema } from "@/lib/ai/schemas"
import type { ExtractQuestionsResultDto } from "@/lib/ai/types"
import type { PageRaster } from "@/lib/documents/types"

/**
 * Extract printed questions (incl. labelled sub-parts) from question-paper pages.
 */
export async function extractQuestionsFromPages(
  pages: PageRaster[]
): Promise<ExtractQuestionsResultDto> {
  if (pages.length === 0) {
    return { questions: [] }
  }

  return generateStructuredJsonFromImages({
    schema: extractQuestionsResultSchema,
    systemInstruction: EXTRACT_QUESTIONS_SYSTEM,
    prompt: buildExtractQuestionsPrompt(pages.length),
    images: pageRastersToGeminiImages(pages),
    temperature: 0.1,
  })
}
