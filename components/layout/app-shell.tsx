"use client"

import type { CSSProperties, ReactNode } from "react"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

type AppShellProps = {
  children: ReactNode
  /** Header breadcrumb / section title on desktop */
  title?: string
  /** Start with expanded (upload) or collapsed (processing/viewer) sidebar */
  defaultSidebarOpen?: boolean
}

/**
 * Floating two-panel app chrome from the Figma screens:
 * soft canvas background, rounded sidebar + main panel with gap.
 */
export function AppShell({
  children,
  title = "Exams",
  defaultSidebarOpen = true,
}: AppShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider
        defaultOpen={defaultSidebarOpen}
        className="min-h-svh bg-canvas has-data-[variant=inset]:bg-canvas"
        style={
          {
            "--sidebar-width": "15.5rem",
            "--sidebar-width-icon": "4.5rem",
          } as CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="overflow-hidden bg-background md:peer-data-[variant=inset]:m-3 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-2xl md:peer-data-[variant=inset]:border md:peer-data-[variant=inset]:border-border/70 md:peer-data-[variant=inset]:shadow-sm">
          <AppHeader title={title} />
          <div className="flex flex-1 flex-col overflow-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
