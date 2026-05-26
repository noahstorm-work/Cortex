import type { Metadata } from "next"
import { ThemeProvider } from "@/components/ui/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cortex Voice - AI Knowledge Workspace",
  description: "Upload, process, and semantically search your documents with voice interaction.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
