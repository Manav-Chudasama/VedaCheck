"use client"

import {
  ChevronsRight,
  PanelLeft,
  Settings,
  Sparkles,
} from "lucide-react"

import { mainNavItems, schoolProfile } from "@/components/layout/nav-config"
import { VedaLogo } from "@/components/layout/veda-logo"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

function SchoolCrest({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted ring-1 ring-border",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="size-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" fill="var(--muted)" />
        <path
          d="M20 6 L32 12 V22 C32 28 26 33 20 35 C14 33 8 28 8 22 V12 L20 6Z"
          fill="var(--foreground)"
          opacity="0.85"
        />
        <path
          d="M20 11 L27 14.5 V22 C27 26 23.5 29.5 20 31 C16.5 29.5 13 26 13 22 V14.5 L20 11Z"
          fill="var(--background)"
        />
        <text
          x="20"
          y="23"
          textAnchor="middle"
          fontSize="7"
          fontWeight="700"
          fill="var(--foreground)"
        >
          DPS
        </text>
      </svg>
    </div>
  )
}

function ToolkitButton() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  if (isCollapsed) {
    return (
      <SidebarMenu className="items-center">
        <SidebarMenuItem className="flex justify-center">
          <SidebarMenuButton
            tooltip="AI Teacher's Toolkit"
            className="size-9! rounded-full! bg-foreground text-background ring-2 ring-brand ring-offset-2 ring-offset-sidebar hover:bg-foreground/90 hover:text-background data-active:bg-foreground data-active:text-background"
          >
            <Sparkles className="size-4" />
            <span className="sr-only">AI Teacher&apos;s Toolkit</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <Button
      className="h-10 w-full justify-start gap-2 rounded-full bg-foreground px-3.5 text-background ring-2 ring-brand ring-offset-2 ring-offset-sidebar hover:bg-foreground/90 hover:text-background"
      size="lg"
    >
      <Sparkles className="size-4" />
      <span className="truncate text-sm font-medium">AI Teacher&apos;s Toolkit</span>
    </Button>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar, state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="border-none **:data-[slot=sidebar-inner]:rounded-2xl **:data-[slot=sidebar-inner]:bg-background **:data-[slot=sidebar-inner]:shadow-[0_16px_48px_rgba(0,0,0,0.08),0_32px_48px_rgba(0,0,0,0.06)]"
      {...props}
    >
      <SidebarHeader className="gap-4 p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "justify-between gap-2"
          )}
        >
          <VedaLogo showWordmark={!isCollapsed} />
          {!isCollapsed ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
            >
              <PanelLeft className="size-4" />
            </Button>
          ) : null}
        </div>

        <div className={cn(isCollapsed && "flex justify-center")}>
          <ToolkitButton />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
        <SidebarGroup className="p-0 group-data-[collapsible=icon]:items-center">
          <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
            <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
              {mainNavItems.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center"
                >
                  <SidebarMenuButton
                    isActive={item.isActive}
                    tooltip={item.title}
                    render={<a href={item.href} />}
                    className="h-9 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground data-active:bg-muted data-active:text-foreground group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:p-0!"
                  >
                    <item.icon className="size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        {!isCollapsed ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Settings"
                className="h-9 rounded-lg text-[13px] font-medium text-muted-foreground"
              >
                <Settings className="size-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}

        {isCollapsed ? (
          <>
            <SchoolCrest className="size-8 rounded-md" />
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl bg-muted/80 px-2.5 py-2.5">
            <SchoolCrest />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold text-foreground">
                {schoolProfile.name}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {schoolProfile.location}
              </p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
