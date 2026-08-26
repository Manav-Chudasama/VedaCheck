export const EXTRACT_QUESTIONS_SYSTEM = `You are an expert at reading printed exam / question papers.
Extract every question and labelled sub-part as a separate entry.
Preserve the original numbering exactly as printed (e.g. "11(a)", "11(b)", "Q.2").
Do not invent questions. Do not merge sub-parts.
Return structured JSON only.`

/**
 * User prompt for question-paper extraction.
 * Page images are attached separately as multimodal parts.
 */
export function buildExtractQuestionsPrompt(pageCount: number): string {
  return `Extract all questions from this question paper (${pageCount} page${pageCount === 1 ? "" : "s"}).

Rules:
1. List questions in the exact printed order (order = 0, 1, 2, …).
2. Treat labelled sub-parts as separate questions — e.g. 11(a) and 11(b) are two entries.
3. Preserve the original question numbering string exactly as printed.
4. Include the full question text (omit running headers/footers/page numbers).
5. If marks/max score are printed for a question, set maxScore; otherwise null.
6. If the paper has no questions, return {"questions": []}.

Respond with JSON matching the schema.`
}
