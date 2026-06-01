"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils/cn"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  FileText,
  Search,
  FolderKanban,
  LogOut,
  Sparkles,
  Menu,
  History,
  ChevronRight,
} from "lucide-react"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/search", label: "Search", icon: Search },
  { href: "/history", label: "History", icon: History },
  { href: "/projects", label: "Projects", icon: FolderKanban },
]

const navGroups = [
  { label: "Workspace", items: navItems.slice(0, 3) },
  { label: "History", items: navItems.slice(3) },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const isActive = (href: string) => pathname.startsWith(href)

  const NavItem = ({ item, mobile }: { item: typeof navItems[number]; mobile?: boolean }) => {
    const active = isActive(item.href)
    const Icon = item.icon
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40",
          active
            ? "glass-strong text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        )}
      >
        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-300",
          active ? "bg-gradient-to-br from-teal-400/20 to-teal-600/20" : "group-hover:bg-muted/50"
        )}>
          <Icon className={cn("h-4 w-4 transition-all duration-300", active && "text-teal-400 scale-110")} aria-hidden="true" />
        </div>
        <span className={cn(active && "font-semibold")}>{item.label}</span>
        {active && (
          <div className="ml-auto flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse-glow" />
          </div>
        )}
      </Link>
    )
  }

  const SidebarContent = ({ mobile }: { mobile?: boolean }) => (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border/60 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-teal-500/30">
            <Sparkles className="h-4.5 w-4.5 text-white" aria-hidden="true" />
          </div>
          <span className="text-base font-display tracking-tight text-foreground">Cortex</span>
        </Link>
        {!mobile && <ThemeToggle />}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/50">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.href} item={item} mobile={mobile} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/60 p-3">
        <div className="rounded-2xl bg-gradient-to-br from-teal-400/[0.04] to-teal-600/[0.04] p-3">
          <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/50">
            Account
          </p>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-muted-foreground transition-all duration-300 hover:bg-background/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50">
              <LogOut className="h-3.5 w-3.5" />
            </div>
            Sign out
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center border-b border-border/60 bg-background/80 backdrop-blur-2xl px-4" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-r-0 bg-background/95 backdrop-blur-2xl">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <SheetDescription className="sr-only">Navigate to different sections of Cortex</SheetDescription>
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>
        <div className="ml-2 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-display tracking-tight">Cortex</span>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <aside className="group/sidebar flex h-screen w-64 flex-col border-r border-border/60 bg-sidebar">
          <SidebarContent />
        </aside>
      </div>
    </>
  )
}
