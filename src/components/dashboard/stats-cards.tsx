"use client"

import Link from "next/link"
import { FileText, Cpu, Search, LayoutDashboard } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"

interface Stat {
  label: string
  value: number | string
  href: string
  gradient: string
  iconBg: string
  accent: string
}

interface StatsCardsProps {
  stats: Stat[]
}

const icons = {
  FileText,
  Cpu,
  Search,
  LayoutDashboard,
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = icons[stat.label === "Documents" ? "FileText" : stat.label === "Indexed Chunks" ? "Cpu" : stat.label === "Searches" ? "Search" : "LayoutDashboard"]
        return (
          <Link
            key={stat.label}
            href={stat.href}
            className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5 animate-fade-in-up stagger-${i + 1}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="absolute -inset-[100%] bg-gradient-to-br from-transparent via-transparent to-white/5 dark:to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 rotate-45" />

            <div className="relative z-10">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.iconBg} shadow-lg ${stat.accent.replace("text-", "shadow-")}/20`}>
                <Icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="text-3xl font-bold tracking-tight text-foreground font-display">
                {typeof stat.value === "number" ? (
                  <AnimatedCounter value={stat.value} />
                ) : (
                  stat.value
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground/70">{stat.label}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
