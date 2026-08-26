import {
  Archive,
  Clock,
  FileText,
  LayoutGrid,
  MonitorPlay,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  isActive?: boolean
}

/** Static product chrome nav — mirrors Figma; Exams is the active assignment route. */
export const mainNavItems: NavItem[] = [
  { title: "Home", href: "#", icon: LayoutGrid },
  { title: "My Classroom", href: "#", icon: MonitorPlay },
  { title: "Assignments", href: "#", icon: FileText },
  { title: "Exams", href: "/", icon: Archive, isActive: true },
  { title: "My Library", href: "#", icon: Clock },
]

export const schoolProfile = {
  name: "Delhi Public School",
  location: "Bokaro Steel City",
}

export const userProfile = {
  name: "Madhur Rastogi",
  initials: "MR",
}
