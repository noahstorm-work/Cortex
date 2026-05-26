import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cortex - AI Knowledge & Automation Workspace",
  description: "Upload, process, and semantically search your documents.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  )
}
