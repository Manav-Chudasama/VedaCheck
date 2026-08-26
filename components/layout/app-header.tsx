"use client"

import {
  Archive,
  ArrowLeft,
  Bell,
  ChevronDown,
  CircleHelp,
  Menu,
  Sparkles,
} from "lucide-react"

import { userProfile } from "@/components/layout/nav-config"
import { VedaLogo } from "@/components/layout/veda-logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"

type AppHeaderProps = {
  title?: string
}

export function AppHeader({ title = "Exams" }: AppHeaderProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 rounded-2xl bg-background/75 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/5 backdrop-blur-md md:px-5">
      {/* Left: back + section label (desktop) / brand (mobile) */}
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="hidden items-center gap-2 md:flex">
          <Separator
            orientation="vertical"
            className="mx-1 data-[orientation=vertical]:h-5"
          />
          <Archive className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
        </div>

        <div className="md:hidden">
          <VedaLogo showWordmark />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-0.5 md:gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden text-muted-foreground md:inline-flex"
          aria-label="Help"
        >
          <CircleHelp className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span
            className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand"
            aria-hidden
          />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden text-muted-foreground md:inline-flex"
          aria-label="AI tools"
        >
          <Sparkles className="size-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="ml-1 hidden items-center gap-2 rounded-full px-1.5 py-1 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
            aria-label="User menu"
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-brand/15 text-[10px] font-semibold text-brand">
                {userProfile.initials}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-36 truncate text-sm font-medium text-foreground">
              {userProfile.name}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Mobile: avatar + hamburger (opens sidebar sheet) */}
        <Avatar size="sm" className="ml-1 md:hidden">
          <AvatarFallback className="bg-brand/15 text-[10px] font-semibold text-brand">
            {userProfile.initials}
          </AvatarFallback>
        </Avatar>

        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label="Open menu"
          onClick={toggleSidebar}
        >
          <Menu className="size-5" />
        </Button>
      </div>
    </header>
  )
}
