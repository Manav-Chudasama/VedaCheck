import { NextResponse } from "next/server"

import { getAssessmentJob } from "@/lib/assessment/store"
import { STAGE_LABELS } from "@/lib/assessment/stages"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/assessments/[id]/result
 * Returns AssessmentViewModel when ready; 409 while processing; 422 on failure.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params

  if (!id?.trim()) {
    return NextResponse.json(
      { error: "Assessment id is required" },
      { status: 400 }
    )
  }

  const job = getAssessmentJob(id)
  if (!job) {
    return NextResponse.json(
      { error: "Assessment not found" },
      { status: 404 }
    )
  }

  if (job.stage === "failed") {
    return NextResponse.json(
      {
        error: job.error ?? "Assessment processing failed",
        stage: job.stage,
        progress: job.progress,
        label: STAGE_LABELS.failed,
      },
      { status: 422 }
    )
  }

  if (job.stage !== "ready" || !job.result) {
    return NextResponse.json(
      {
        error: "Assessment is not ready yet",
        stage: job.stage,
        progress: job.progress,
        label: STAGE_LABELS[job.stage],
      },
      { status: 409 }
    )
  }

  return NextResponse.json(
    {
      ...job.result,
      overallFeedback: job.overallFeedback ?? null,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
