import type { AssessmentViewModel } from "@/lib/assessment/types"

/** Static fixture kept for UI reference; live flow uses the OpenAI pipeline. */
export const mockAssessment: AssessmentViewModel = {
  pages: [
    { page: 1, label: "Page 1" },
    { page: 2, label: "Page 2" },
    { page: 3, label: "Page 3" },
    { page: 4, label: "Page 4" },
  ],
  unmatchedAnswers: [],
  items: [
    {
      question: {
        id: "q1",
        number: "1",
        text: "Which of the following organelles is primarily involved in photosynthesis?",
        order: 1,
        maxScore: 2,
      },
      answer: {
        questionId: "q1",
        transcription:
          "Photosynthesis mainly occurs in the chloroplast of the plant cell.",
        regions: [{ page: 1, bbox: [0.08, 0.12, 0.92, 0.28] }],
        score: 2,
        maxScore: 2,
        feedback:
          "Correct — chloroplast is the organelle responsible for photosynthesis.",
      },
      status: "answered",
    },
    {
      question: {
        id: "q2",
        number: "2",
        text: "Which of the following organelles is primarily involved in photosynthesis?",
        order: 2,
        maxScore: 2,
      },
      answer: {
        questionId: "q2",
        transcription:
          "Q2. The process mainly occurs in the chloroplast of the plant cell. It has two main stages: 1. Light reaction — Captures light energy. 2. Dark reaction — Uses energy to make glucose.",
        regions: [
          { page: 1, bbox: [0.08, 0.42, 0.92, 0.72] },
          { page: 2, bbox: [0.08, 0.1, 0.92, 0.35] },
        ],
        score: 2,
        maxScore: 2,
        feedback:
          "Excellent work! You correctly identified the chloroplast as the organelle responsible for photosynthesis. Keep it up!",
      },
      status: "answered",
    },
    {
      question: {
        id: "q3",
        number: "3",
        text: "Draw a labelled diagram of an alveolus showing capillaries and air space.",
        order: 3,
        maxScore: 5,
      },
      answer: {
        questionId: "q3",
        transcription: "Diagram of alveolus with labels for air space and capillaries.",
        regions: [{ page: 2, bbox: [0.1, 0.4, 0.9, 0.75] }],
        score: 4,
        maxScore: 5,
        feedback: "Clear diagram. One label is slightly imprecise — nearly full marks.",
      },
      status: "answered",
    },
    {
      question: {
        id: "q4",
        number: "4",
        text: "Describe the process of transpiration in plants.",
        order: 4,
        maxScore: 5,
      },
      answer: {
        questionId: "q4",
        transcription: "Water evaporates from leaves through stomata…",
        regions: [{ page: 3, bbox: [0.08, 0.15, 0.92, 0.45] }],
        score: 3,
        maxScore: 5,
        feedback: "Good outline of stomatal water loss; add more on the cohesion-tension pull.",
      },
      status: "answered",
    },
    {
      question: {
        id: "q5",
        number: "5",
        text: "Name the blood vessel that carries blood away from the heart.",
        order: 5,
        maxScore: 2,
      },
      answer: {
        questionId: "q5",
        transcription: "Vein",
        regions: [{ page: 3, bbox: [0.08, 0.55, 0.6, 0.68] }],
        score: 0,
        maxScore: 2,
        feedback: "Incorrect — the artery (aorta) carries blood away from the heart.",
      },
      status: "answered",
    },
    {
      question: {
        id: "q11a",
        number: "11(a)",
        text: "Define osmosis.",
        order: 6,
        maxScore: 3,
      },
      answer: {
        questionId: "q11a",
        transcription:
          "Osmosis is the movement of water from high to low water potential through a partially permeable membrane.",
        regions: [{ page: 4, bbox: [0.08, 0.12, 0.92, 0.32] }],
        score: 3,
        maxScore: 3,
        feedback: "Accurate definition — full marks.",
      },
      status: "answered",
    },
    {
      question: {
        id: "q11b",
        number: "11(b)",
        text: "Give one example of osmosis in living cells.",
        order: 7,
        maxScore: 2,
      },
      answer: null,
      status: "unanswered",
    },
  ],
}
