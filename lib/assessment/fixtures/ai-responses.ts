import type {
  ExtractAnswersResultDto,
  ExtractQuestionsResultDto,
  GradeAnswersResultDto,
  MapAnswersResultDto,
} from "@/lib/ai/types"

/** Sub-parts + normal questions in printed order. */
export const fixtureExtractQuestions: ExtractQuestionsResultDto = {
  questions: [
    {
      number: "1",
      text: "What is photosynthesis?",
      order: 0,
      maxScore: 2,
    },
    {
      number: "2",
      text: "Name the organelle where photosynthesis occurs.",
      order: 1,
      maxScore: 2,
    },
    {
      number: "11(a)",
      text: "Define osmosis.",
      order: 2,
      maxScore: 3,
    },
    {
      number: "11(b)",
      text: "Give one example of osmosis in living cells.",
      order: 3,
      maxScore: 2,
    },
  ],
}

/**
 * Out-of-order answers, multi-page region, unmatched scribble,
 * and missing answer for 11(b).
 */
export const fixtureExtractAnswers: ExtractAnswersResultDto = {
  answers: [
    {
      questionLabel: "11(a)",
      transcription:
        "Osmosis is water movement through a partially permeable membrane.",
      regions: [{ page: 2, bbox: [0.1, 0.1, 0.9, 0.35] }],
      confidence: 0.9,
    },
    {
      questionLabel: "1",
      transcription: "Process by which plants make food using light.",
      regions: [
        { page: 1, bbox: [0.08, 0.12, 0.92, 0.28] },
        { page: 1, bbox: [0.08, 0.3, 0.92, 0.4] },
      ],
      confidence: 0.85,
    },
    {
      questionLabel: "2",
      transcription: "Chloroplast",
      regions: [{ page: 1, bbox: [100, 500, 900, 650] }],
      confidence: 0.95,
    },
    {
      questionLabel: null,
      transcription: "Random margin note not tied to a question.",
      regions: [{ page: 2, bbox: [0.1, 0.7, 0.9, 0.9] }],
      confidence: 0.4,
    },
  ],
}

/** LLM second-pass that maps the unmatched scribble incorrectly (ignored if invalid). */
export const fixtureMapAnswersLlm: MapAnswersResultDto = {
  mappings: [
    { answerIndex: 0, questionNumber: "11(a)", confidence: 0.99 },
    { answerIndex: 1, questionNumber: "1", confidence: 0.99 },
    { answerIndex: 2, questionNumber: "2", confidence: 0.99 },
    { answerIndex: 3, questionNumber: null, confidence: 0.1 },
  ],
  unansweredQuestionNumbers: ["11(b)"],
  unmatchedAnswerIndexes: [3],
}

export const fixtureGrades: GradeAnswersResultDto = {
  grades: [
    {
      questionNumber: "1",
      score: 2,
      maxScore: 2,
      feedback: "Correct definition.",
    },
    {
      questionNumber: "2",
      score: 2,
      maxScore: 2,
      feedback: "Correct organelle.",
    },
    {
      questionNumber: "11(a)",
      score: 3,
      maxScore: 3,
      feedback: "Accurate definition.",
    },
  ],
  overallFeedback: "Strong answers overall; 11(b) was left blank.",
}

/** Invalid AI-shaped payloads for schema rejection tests. */
export const fixtureInvalidExtractQuestions = {
  questions: [{ number: "", text: "Missing number", order: 0 }],
}

export const fixtureInvalidExtractAnswers = {
  answers: [
    {
      questionLabel: "1",
      transcription: "ok",
      regions: [],
    },
  ],
}
