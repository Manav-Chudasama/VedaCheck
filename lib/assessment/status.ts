import { STAGE_LABELS, type ProcessingStage } from "@/lib/assessment/stages"
import { getAssessmentJob, type AssessmentStatusDto } from "@/lib/assessment/store"

export function getAssessmentStatus(
  id: string
): AssessmentStatusDto | undefined {
  const job = getAssessmentJob(id)
  if (!job) return undefined

  return {
    id: job.id,
    stage: job.stage,
    progress: job.progress,
    error: job.error,
    label: STAGE_LABELS[job.stage as ProcessingStage],
  }
}
