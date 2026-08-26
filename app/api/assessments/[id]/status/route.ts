import { NextResponse } from "next/server"

import { getAssessmentStatus } from "@/lib/assessment/status"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/assessments/[id]/status
 * Polling payload: stage, progress, label, error.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params

  if (!id?.trim()) {
    return NextResponse.json(
      { error: "Assessment id is required" },
      { status: 400 }
    )
  }

  const status = getAssessmentStatus(id)
  if (!status) {
    return NextResponse.json(
      { error: "Assessment not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
