"use client"

import { useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { ExtractingScreen } from "@/components/processing/extracting-screen"
import { UploadScreen } from "@/components/upload/upload-screen"

export type AssessmentPhase = "upload" | "extracting"

/**
 * Client flow: upload → extracting (loading) → (viewer later).
 * Collapses the sidebar when entering the loading state (per Loading state.png).
 */
export function AssessmentFlow() {
  const [phase, setPhase] = useState<AssessmentPhase>("upload")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <AppShell
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      contentMode={phase === "extracting" ? "panel" : "canvas"}
    >
      {phase === "upload" ? (
        <UploadScreen
          onStartMapping={() => {
            setSidebarOpen(false)
            setPhase("extracting")
          }}
        />
      ) : (
        <ExtractingScreen />
      )}
    </AppShell>
  )
}
