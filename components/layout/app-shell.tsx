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
 * Layout from `Upload Screen - Empty State.svg`:
 * gradient canvas, floating sidebar card, floating header card,
 * content sits on the canvas (not inside a large white panel).
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
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
