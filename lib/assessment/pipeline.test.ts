import { describe, expect, test } from "bun:test"
import sharp from "sharp"

import type { PipelineAiDeps } from "@/lib/assessment/pipeline"
import { runAssessmentPipeline } from "@/lib/assessment/pipeline"
import {
  createAssessmentJob,
  getAssessmentJob,
} from "@/lib/assessment/store"
import {
  fixtureExtractAnswers,
  fixtureExtractQuestions,
  fixtureGrades,
  fixtureMapAnswersLlm,
} from "@/lib/assessment/fixtures/gemini-responses"

async function tinyPng(): Promise<Buffer> {
  return sharp({
    create: {
      width: 120,
      height: 160,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .png()
    .toBuffer()
}

function mockAiDeps(): PipelineAiDeps {
  return {
    extractQuestions: async () => fixtureExtractQuestions,
    extractAnswers: async () => fixtureExtractAnswers,
    mapAnswers: async () => fixtureMapAnswersLlm,
    gradeAnswers: async () => fixtureGrades,
  }
}

describe("runAssessmentPipeline (mocked Gemini)", () => {
  test("reaches ready with answered / unanswered / unmatched items", async () => {
    const png = await tinyPng()
    const job = createAssessmentJob()

    await runAssessmentPipeline(job.id, {
      questionPaper: {
        data: png,
        mimeType: "image/png",
        fileName: "qp.png",
      },
      answerSheet: {
        data: png,
        mimeType: "image/png",
        fileName: "as.png",
      },
      ai: mockAiDeps(),
      enableGrading: true,
    })

    const done = getAssessmentJob(job.id)
    expect(done?.stage).toBe("ready")
    expect(done?.progress).toBe(100)
    expect(done?.error).toBeUndefined()
    expect(done?.result).toBeDefined()

    const items = done?.result?.items ?? []
    const byNumber = Object.fromEntries(
      items.map((item) => [item.question.number, item])
    )

    expect(byNumber["1"]?.status).toBe("answered")
    expect(byNumber["11(b)"]?.status).toBe("unanswered")
    expect(done?.result?.unmatchedAnswers.length).toBe(1)
    expect(done?.result?.pages[0]?.imageUrl).toBe(
      `/api/assessments/${job.id}/pages/1`
    )
    expect(done?.overallFeedback).toContain("11(b)")
  })

  test("marks job failed when AI extract throws", async () => {
    const png = await tinyPng()
    const job = createAssessmentJob()

    await expect(
      runAssessmentPipeline(job.id, {
        questionPaper: {
          data: png,
          mimeType: "image/png",
          fileName: "qp.png",
        },
        answerSheet: {
          data: png,
          mimeType: "image/png",
          fileName: "as.png",
        },
        ai: {
          extractQuestions: async () => {
            throw new Error("mock Gemini rate limit")
          },
          extractAnswers: async () => fixtureExtractAnswers,
        },
        enableGrading: false,
      })
    ).rejects.toThrow("mock Gemini rate limit")

    const failed = getAssessmentJob(job.id)
    expect(failed?.stage).toBe("failed")
    expect(failed?.error).toContain("mock Gemini rate limit")
  })
})
