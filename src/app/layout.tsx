import type { Metadata } from "next"
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { SonnerToast } from "@/components/ui/sonner-toast"
import "./globals.css"

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Cortex — AI Knowledge Workspace",
  description: "Upload, process, and semantically search your documents.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSerifDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable} min-h-screen bg-background font-sans text-foreground antialiased noise`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <SonnerToast />
        </ThemeProvider>
      </body>
    </html>
  )
}
