"use client"

import { useEffect, useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { ExtractingScreen } from "@/components/processing/extracting-screen"
import { UploadScreen } from "@/components/upload/upload-screen"
import { MappingScreen } from "@/components/viewer/mapping-screen"
import { mockAssessment } from "@/lib/assessment/mock-assessment"

export type AssessmentPhase = "upload" | "extracting" | "mapping"

const EXTRACTING_MS = 2800

/**
 * Client flow: upload → extracting → mapping viewer (mock data for now).
 * Sidebar collapses for extracting + mapping (per Figma loading/viewer frames).
 */
export function AssessmentFlow() {
  const [phase, setPhase] = useState<AssessmentPhase>("upload")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (phase !== "extracting") return
    const timer = window.setTimeout(() => {
      setPhase("mapping")
    }, EXTRACTING_MS)
    return () => window.clearTimeout(timer)
  }, [phase])

  return (
    <AppShell
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      contentMode={phase === "upload" ? "canvas" : "panel"}
    >
      {phase === "upload" ? (
        <UploadScreen
          onStartMapping={() => {
            setSidebarOpen(false)
            setPhase("extracting")
          }}
        />
      ) : null}
      {phase === "extracting" ? <ExtractingScreen /> : null}
      {phase === "mapping" ? (
        <MappingScreen assessment={mockAssessment} />
      ) : null}
    </AppShell>
  )
}
