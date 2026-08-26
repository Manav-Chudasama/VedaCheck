"use client"

import type { CSSProperties, ReactNode } from "react"

import { AppHeader } from "@/components/layout/app-header"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type AppShellProps = {
  children: ReactNode
  /** Header breadcrumb / section title on desktop */
  title?: string
  /** Controlled sidebar open state (upload expanded, extracting collapsed) */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * `canvas` — content on gradient (upload).
   * `panel` — white rounded content card (loading / viewer).
   */
  contentMode?: "canvas" | "panel"
}

/**
 * Shell: gradient canvas, floating sidebar + header.
 * Loading/viewer modes wrap children in a white content panel.
 */
export function AppShell({
  children,
  title = "Exams",
  open,
  onOpenChange,
  contentMode = "canvas",
}: AppShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider
        open={open}
        onOpenChange={onOpenChange}
        className="h-svh overflow-hidden bg-[linear-gradient(180deg,var(--canvas)_0%,var(--canvas-end)_100%)] has-data-[variant=inset]:bg-[linear-gradient(180deg,var(--canvas)_0%,var(--canvas-end)_100%)]"
        style={
          {
            "--sidebar-width": "16.5rem",
            "--sidebar-width-icon": "4.75rem",
          } as CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset className="m-0 min-h-0 overflow-hidden bg-transparent md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:border-0 md:peer-data-[variant=inset]:shadow-none">
          <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden p-3 md:pl-0">
            <AppHeader title={title} />
            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col overflow-hidden",
                contentMode === "panel" && "min-h-0"
              )}
            >
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
