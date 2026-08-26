export const EXTRACT_QUESTIONS_SYSTEM = `You are an expert at reading printed exam / question papers.
Extract every question and labelled sub-part as a separate entry.
Also extract section/group instructions (e.g. "Attempt any FIVE of the following : 10 Marks").
Preserve the original numbering exactly as printed (e.g. "11(a)", "11(b)", "Q.2").
Do not invent questions. Do not merge sub-parts.
Return structured JSON only.`

/**
 * User prompt for question-paper extraction.
 * Page images are attached separately as multimodal parts.
 */
export function buildExtractQuestionsPrompt(pageCount: number): string {
  return `Extract all questions and groups from this question paper (${pageCount} page${pageCount === 1 ? "" : "s"}).

Rules:
1. List questions in the exact printed order (order = 0, 1, 2, …).
2. Treat labelled sub-parts as separate questions — e.g. 1(a) and 1(b) are two entries with numbers "1(a)" and "1(b)".
3. Preserve the original question numbering string exactly as printed.
4. Include the full question text (omit running headers/footers/page numbers).
5. Set totalMarks from the paper header when printed (e.g. "70 Marks" → 70); otherwise null.
6. Extract groups[] for each numbered section that has an "Attempt any N …" (or similar) instruction:
   - number: the section number as printed ("1", "2", …)
   - title: the instruction text
   - attemptCount: N (how many options to attempt)
   - optionCount: how many sub-parts are listed under that section
   - maxScore: the marks printed for that section (often after a colon, e.g. ": 10"); null if unknown
7. For each sub-part question, set groupNumber to the parent section number (e.g. "1" for "1(a)").
8. If marks are printed on an individual sub-part, set that question's maxScore; otherwise null (do NOT invent per-item marks when only the group total is printed).
9. If there are no section groups (flat paper), return groups: [] and leave groupNumber null.
10. If the paper has no questions, return {"totalMarks": null, "groups": [], "questions": []}.

Respond with JSON matching the schema.`
}
