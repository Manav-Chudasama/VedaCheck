"use client"

import { useQuery } from "@tanstack/react-query"

import {
  fetchAssessmentResult,
  fetchAssessmentStatus,
  type AssessmentResultResponse,
  type AssessmentStatusResponse,
} from "@/lib/assessment/api-client"
import { isTerminalStage } from "@/lib/assessment/stages"

const STATUS_POLL_MS = 1500

/**
 * Poll assessment status until ready/failed, then fetch the result once ready.
 */
export function useAssessmentProcessing(assessmentId: string | null) {
  const statusQuery = useQuery<AssessmentStatusResponse>({
    queryKey: ["assessment-status", assessmentId],
    queryFn: () => fetchAssessmentStatus(assessmentId!),
    enabled: Boolean(assessmentId),
    refetchInterval: (query) => {
      const stage = query.state.data?.stage
      if (!stage || isTerminalStage(stage)) return false
      return STATUS_POLL_MS
    },
  })

  const isReady = statusQuery.data?.stage === "ready"
  const isFailed = statusQuery.data?.stage === "failed"

  const resultQuery = useQuery<AssessmentResultResponse>({
    queryKey: ["assessment-result", assessmentId],
    queryFn: () => fetchAssessmentResult(assessmentId!),
    enabled: Boolean(assessmentId) && isReady,
    retry: 1,
  })

  return {
    status: statusQuery.data ?? null,
    result: resultQuery.data ?? null,
    isStatusLoading: statusQuery.isLoading,
    isResultLoading: resultQuery.isLoading,
    isFailed,
    isReady,
    statusError: statusQuery.error,
    resultError: resultQuery.error,
    refetchStatus: statusQuery.refetch,
  }
}
