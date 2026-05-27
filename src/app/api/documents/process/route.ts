import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { chunkText } from "@/lib/chunking"
import { generateEmbeddings } from "@/lib/embeddings"
import { ocrImage, ocrPDF } from "@/lib/ocr"

export async function POST(request: Request) {
  let user: { id: string } | null = null

  const cookieClient = await createServerSupabaseClient()
  const { data: { user: cookieUser } } = await cookieClient.auth.getUser()
  user = cookieUser

  const adminClient = createAdminClient()

  const body = await request.json()
  const { document_id, file_url, user_id } = body

  if (!document_id || !file_url) {
    return NextResponse.json(
      { error: "document_id and file_url are required" },
      { status: 400 }
    )
  }

  if (!user && !user_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const effectiveUserId = user?.id || user_id

  try {
    const { data: doc } = await adminClient
      .from("documents")
      .select("id")
      .eq("id", document_id)
      .eq("user_id", effectiveUserId)
      .single()

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const storagePath = file_url.split("/public/documents/")[1]
    if (!storagePath) {
      throw new Error("Could not extract storage path from file URL")
    }

    const { data: fileData, error: downloadError } = await adminClient.storage
      .from("documents")
      .download(storagePath)

    if (downloadError || !fileData) {
      throw new Error("Failed to fetch document file: " + (downloadError?.message || "unknown"))
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
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

    const batchSize = 20
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      const embeddings = await generateEmbeddings(batch)
      const rows = batch.map((content, j) => ({
        document_id,
        content,
        embedding: embeddings[j],
      }))
      const { error: insertError } = await adminClient.from("chunks").insert(rows)
      if (insertError) throw new Error("Failed to insert chunks: " + insertError.message)
    }

    await adminClient.from("documents").update({ status: "ready" }).eq("id", document_id)

    return NextResponse.json({
      chunks_created: chunks.length,
      document_id,
    })
  } catch (error) {
    try { await adminClient.from("documents").update({ status: "failed" }).eq("id", document_id) } catch {}
    console.error("Process error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process document" },
      { status: 500 }
    )
  }
}
