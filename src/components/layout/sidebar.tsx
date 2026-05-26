"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils/cn"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  FileText,
  Search,
  FolderKanban,
  LogOut,
  Sparkles,
  Menu,
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

  return (
    <>
      {/* Mobile nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center border-b bg-background px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-14 items-center border-b border-sidebar-border px-4">
              <Link href="/documents" className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                <span className="text-sm font-bold text-sidebar-foreground">
                  Cortex Voice
                </span>
              </Link>
            </div>
            <nav className="space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-sidebar-border p-4">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </SheetContent>
        </Sheet>
        <Sparkles className="ml-2 h-5 w-5 text-violet-500" />
        <span className="ml-2 text-sm font-bold">Cortex Voice</span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      <div className="hidden md:flex">
        <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
          <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
            <Link href="/documents" className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-500" />
              <span className="text-sm font-bold text-sidebar-foreground">
                Cortex Voice
              </span>
            </Link>
            <ThemeToggle />
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-sidebar-border p-4">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}
