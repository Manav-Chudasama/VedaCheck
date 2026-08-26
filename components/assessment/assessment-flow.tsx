"use client"

import { useEffect, useState } from "react"
import { useMutation } from "@tanstack/react-query"

import { AppShell } from "@/components/layout/app-shell"
import { ExtractingScreen } from "@/components/processing/extracting-screen"
import { UploadScreen } from "@/components/upload/upload-screen"
import { MappingScreen } from "@/components/viewer/mapping-screen"
import { useAssessmentProcessing } from "@/hooks/use-assessment-processing"
import {
  AssessmentApiError,
  createAssessment,
} from "@/lib/assessment/api-client"
import type { AssessmentViewModel } from "@/lib/assessment/types"

export type AssessmentPhase = "upload" | "extracting" | "mapping"

/**
 * Client flow: upload → extracting (polled status) → mapping viewer.
 * Sidebar collapses for extracting + mapping.
 */
export function AssessmentFlow() {
  const [phase, setPhase] = useState<AssessmentPhase>("upload")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [assessment, setAssessment] = useState<AssessmentViewModel | null>(null)
  const [flowError, setFlowError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: createAssessment,
  })

  const {
    status,
    result,
    isFailed,
    statusError,
    resultError,
  } = useAssessmentProcessing(assessmentId)

  useEffect(() => {
    if (!result || phase !== "extracting") return
    setAssessment(result)
    setPhase("mapping")
  }, [result, phase])

  useEffect(() => {
    if (!isFailed || !status) return
    setFlowError(status.error ?? "Assessment processing failed")
  }, [isFailed, status])

  useEffect(() => {
    if (!statusError) return
    setFlowError(
      statusError instanceof Error
        ? statusError.message
        : "Failed to load assessment status"
    )
  }, [statusError])

  useEffect(() => {
    if (!resultError) return
    setFlowError(
      resultError instanceof Error
        ? resultError.message
        : "Failed to load assessment result"
    )
  }, [resultError])

  const resetToUpload = () => {
    setPhase("upload")
    setSidebarOpen(true)
    setAssessmentId(null)
    setAssessment(null)
    setFlowError(null)
    createMutation.reset()
  }

  const handleStartMapping = async (files: {
    questionPaper: File
    answerSheet: File
  }) => {
    setFlowError(null)
    setAssessment(null)
    setSidebarOpen(false)
    setPhase("extracting")

    try {
      const created = await createMutation.mutateAsync(files)
      setAssessmentId(created.id)
    } catch (error) {
      const message =
        error instanceof AssessmentApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Upload failed"
      setFlowError(message)
    }
  }

  return (
    <AppShell
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      contentMode={phase === "upload" ? "canvas" : "panel"}
    >
      {phase === "upload" ? (
        <UploadScreen
          isSubmitting={createMutation.isPending}
          onStartMapping={handleStartMapping}
        />
      ) : null}

      {phase === "extracting" ? (
        <ExtractingScreen
          stage={status?.stage ?? "uploading"}
          progress={status?.progress ?? (createMutation.isPending ? 5 : 0)}
          label={status?.label}
          error={flowError}
          onRetry={resetToUpload}
        />
      ) : null}

      {phase === "mapping" && assessment ? (
        <MappingScreen assessment={assessment} />
      ) : null}
    </AppShell>
  )
}
