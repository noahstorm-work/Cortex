import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { chunkText } from "@/lib/chunking"
import { generateEmbedding } from "@/lib/embeddings"
import { ocrImage, ocrPDF } from "@/lib/ocr"

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { document_id, file_url } = await request.json()

  if (!document_id || !file_url) {
    return NextResponse.json(
      { error: "document_id and file_url are required" },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(file_url)
    if (!response.ok) {
      throw new Error("Failed to fetch document file")
    }

    const buffer = await response.arrayBuffer()
    let text: string

    if (file_url.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default
      const pdfData = await pdfParse(Buffer.from(buffer))
      text = pdfData.text

      if (text.trim().length < 50) {
        text = await ocrPDF(Buffer.from(buffer))
      }
    } else if (file_url.endsWith(".docx")) {
      const mammoth = await import("mammoth")
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
      text = result.value
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(file_url)) {
      text = await ocrImage(Buffer.from(buffer))
    } else {
      text = new TextDecoder("utf-8").decode(buffer)
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Document contains no extractable text" },
        { status: 400 }
      )
    }

    const chunks = chunkText(text)
    const adminClient = createAdminClient()

    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i]
      const embedding = await generateEmbedding(content)

      const { error: insertError } = await adminClient.from("chunks").insert({
        document_id,
        content,
        embedding,
      })

      if (insertError) {
        console.error(`Failed to insert chunk ${i}:`, insertError)
      }
    }

    return NextResponse.json({
      chunks_created: chunks.length,
      document_id,
    })
  } catch (error) {
    console.error("Process error:", error)
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    )
  }
}
