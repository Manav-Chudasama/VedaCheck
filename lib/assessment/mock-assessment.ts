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
  groups: [
    {
      id: "group-1",
      number: "1",
      title: "Attempt any THREE of the following",
      attemptCount: 3,
      optionCount: 5,
      maxScore: 6,
      questionIds: ["q1", "q2", "q3", "q4", "q5"],
    },
    {
      id: "group-11",
      number: "11",
      title: "Attempt any ONE of the following",
      attemptCount: 1,
      optionCount: 2,
      maxScore: 5,
      questionIds: ["q11a", "q11b"],
    },
  ],
  summary: {
    paperMaxScore: 11,
    obtainedScore: 9,
    groupScores: [
      {
        groupId: "group-1",
        obtained: 6,
        maxScore: 6,
        countedQuestionIds: ["q1", "q2", "q3"],
        excludedQuestionIds: ["q4", "q5"],
      },
      {
        groupId: "group-11",
        obtained: 3,
        maxScore: 5,
        countedQuestionIds: ["q11a"],
        excludedQuestionIds: [],
      },
    ],
  },
  items: [
    {
      question: {
        id: "q1",
        number: "1(a)",
        text: "Which of the following organelles is primarily involved in photosynthesis?",
        order: 1,
        maxScore: 2,
        groupId: "group-1",
        countedTowardTotal: true,
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
        number: "1(b)",
        text: "Which of the following organelles is primarily involved in photosynthesis?",
        order: 2,
        maxScore: 2,
        groupId: "group-1",
        countedTowardTotal: true,
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
        number: "1(c)",
        text: "Draw a labelled diagram of an alveolus showing capillaries and air space.",
        order: 3,
        maxScore: 2,
        groupId: "group-1",
        countedTowardTotal: true,
      },
      answer: {
        questionId: "q3",
        transcription: "Diagram of alveolus with labels for air space and capillaries.",
        regions: [{ page: 2, bbox: [0.1, 0.4, 0.9, 0.75] }],
        score: 2,
        maxScore: 2,
        feedback: "Clear diagram — full marks for this attempt.",
      },
      status: "answered",
    },
    {
      question: {
        id: "q4",
        number: "1(d)",
        text: "Describe the process of transpiration in plants.",
        order: 4,
        maxScore: 2,
        groupId: "group-1",
        countedTowardTotal: false,
      },
      answer: {
        questionId: "q4",
        transcription: "Water evaporates from leaves through stomata…",
        regions: [{ page: 3, bbox: [0.08, 0.15, 0.92, 0.45] }],
        score: 1,
        maxScore: 2,
        feedback: "Good outline; not counted toward total (attempt limit).",
      },
      status: "answered",
    },
    {
      question: {
        id: "q5",
        number: "1(e)",
        text: "Name the blood vessel that carries blood away from the heart.",
        order: 5,
        maxScore: 2,
        groupId: "group-1",
        countedTowardTotal: false,
      },
      answer: {
        questionId: "q5",
        transcription: "Vein",
        regions: [{ page: 3, bbox: [0.08, 0.55, 0.6, 0.68] }],
        score: 0,
        maxScore: 2,
        feedback: "Incorrect — artery carries blood away from the heart.",
      },
      status: "answered",
    },
    {
      question: {
        id: "q11a",
        number: "11(a)",
        text: "Define osmosis.",
        order: 6,
        maxScore: 5,
        groupId: "group-11",
        countedTowardTotal: true,
      },
      answer: {
        questionId: "q11a",
        transcription:
          "Osmosis is the movement of water from high to low water potential through a partially permeable membrane.",
        regions: [{ page: 4, bbox: [0.08, 0.12, 0.92, 0.32] }],
        score: 3,
        maxScore: 5,
        feedback: "Solid definition — partial marks for missing water-potential phrasing detail.",
      },
      status: "answered",
    },
    {
      question: {
        id: "q11b",
        number: "11(b)",
        text: "Give one example of osmosis in living cells.",
        order: 7,
        maxScore: 5,
        groupId: "group-11",
        countedTowardTotal: false,
      },
      answer: null,
      status: "unanswered",
    },
  ],
}
