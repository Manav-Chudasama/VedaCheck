import { after, NextResponse } from "next/server"

import { AiConfigError } from "@/lib/ai/errors"
import { runOpenAiAssessmentPipeline } from "@/lib/ai/run-pipeline"
import { createAssessmentJob } from "@/lib/assessment/store"
import {
  parseAssessmentUploadForm,
  parseEnableGradingFlag,
} from "@/lib/upload/validate-upload"

/** Allow long OpenAI + rasterization work on supported hosts. */
export const maxDuration = 300
export const runtime = "nodejs"

/**
 * POST /api/assessments
 * multipart/form-data: questionPaper (1+), answerSheet (1+) [, enableGrading]
 * Each field: one PDF or multiple images (repeat the field name).
 * Returns `{ id }` immediately; pipeline continues via `after()`.
 */
export async function POST(request: Request) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      {
        error: {
          field: "form",
          message: "Expected multipart form data with uploaded files.",
        },
      },
      { status: 400 }
    )
  }

  const parsed = await parseAssessmentUploadForm(formData)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  // Fail fast when the API key is missing (before creating a job).
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error: {
          field: "form",
          message: new AiConfigError().message,
        },
      },
      { status: 500 }
    )
  }

  const enableGrading = parseEnableGradingFlag(formData)
  const job = createAssessmentJob()

  const questionPaper = parsed.questionPaper.map((part) => ({
    data: part.buffer,
    mimeType: part.mimeType,
    fileName: part.fileName,
  }))
  const answerSheet = parsed.answerSheet.map((part) => ({
    data: part.buffer,
    mimeType: part.mimeType,
    fileName: part.fileName,
  }))

  after(async () => {
    try {
      await runOpenAiAssessmentPipeline(job.id, {
        questionPaper,
        answerSheet,
        enableGrading,
      })
    } catch (error) {
      // Pipeline already marks the job failed; log for server diagnostics.
      const message =
        error instanceof Error ? error.message : "Pipeline failed"
      console.error(`[assessment ${job.id}] ${message}`)
    }
  })

  return NextResponse.json(
    {
      id: job.id,
      statusUrl: `/api/assessments/${job.id}/status`,
      resultUrl: `/api/assessments/${job.id}/result`,
    },
    { status: 202 }
  )
}
