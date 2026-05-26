"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils/cn"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  FileText,
  Search,
  FolderKanban,
  LogOut,
  Sparkles,
  Menu,
  ChevronRight,
} from "lucide-react"

const navItems = [
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/search", label: "Search", icon: Search },
  { href: "/projects", label: "Projects", icon: FolderKanban },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center border-b border-border bg-background/80 backdrop-blur-xl px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-r-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <SheetDescription className="sr-only">Navigate to different sections of Cortex Voice</SheetDescription>
            <div className="flex h-14 items-center border-b border-border px-4">
              <Link href="/documents" className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold tracking-tight">Cortex Voice</span>
              </Link>
            </div>
            <nav className="space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-amber-400/10 text-amber-500 shadow-sm"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 transition-transform duration-200", active && "scale-110")} />
                    {item.label}
                    {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-amber-400" />}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-border p-4">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </SheetContent>
        </Sheet>
        <div className="ml-2 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Cortex Voice</span>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      <div className="hidden md:flex">
        <aside className="group/sidebar flex h-screen w-64 flex-col border-r border-border bg-sidebar">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <Link href="/documents" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm shadow-amber-500/20 transition-transform duration-200 group-hover/sidebar:scale-105">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Cortex Voice</span>
            </Link>
            <ThemeToggle />
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            {navItems.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-amber-400/10 text-amber-500 shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-all duration-200", active && "scale-110 text-amber-400")} />
                  {item.label}
                  {active && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-glow" />
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-border p-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-400/5 to-amber-600/5 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
                Workspace
              </p>
              <div className="mt-2 space-y-1">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-background/50 hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
