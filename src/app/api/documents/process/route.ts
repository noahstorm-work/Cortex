import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { chunkText } from "@/lib/chunking";
import { generateEmbeddings } from "@/lib/embeddings";
import { ocrImage, ocrPDF } from "@/lib/ocr";
import { processSchema } from "@/lib/validation/schemas";
import { checkRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";
import { extractStoragePath } from "@/lib/storage";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`process:${ip}`, API_RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const cookieClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await cookieClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = processSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { document_id } = parsed.data;

  try {
    const { data: doc } = await adminClient
      .from("documents")
      .select("id, file_url, file_type")
      .eq("id", document_id)
      .eq("user_id", user.id)
      .single();

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const storagePath = extractStoragePath(doc.file_url);
    if (!storagePath) {
      throw new Error("Could not extract storage path from file URL");
    }

    const { data: fileData, error: downloadError } = await adminClient.storage
      .from("documents")
      .download(storagePath);

    if (downloadError || !fileData) {
      throw new Error("Failed to fetch document file: " + (downloadError?.message || "unknown"));
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    let text: string;

    if (doc.file_url.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(Buffer.from(buffer));
      text = pdfData.text;

      if (text.trim().length < 50) {
        text = await ocrPDF(Buffer.from(buffer));
      }
    } else if (doc.file_url.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      text = result.value;
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(doc.file_url)) {
      text = await ocrImage(Buffer.from(buffer));
    } else {
      text = new TextDecoder("utf-8").decode(buffer);
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "Document contains no extractable text" }, { status: 400 });
    }

    const chunks = chunkText(text);

    const batchSize = 20;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const embeddings = await generateEmbeddings(batch);
      const rows = batch.map((content, j) => ({
        document_id,
        content,
        embedding: embeddings[j],
      }));
      const { error: insertError } = await adminClient.from("chunks").insert(rows);
      if (insertError) throw new Error("Failed to insert chunks: " + insertError.message);
    }

    await adminClient.from("documents").update({ status: "ready" }).eq("id", document_id);

    return NextResponse.json({
      chunks_created: chunks.length,
      document_id,
    });
  } catch (error) {
    try {
      await adminClient.from("documents").update({ status: "failed" }).eq("id", document_id);
    } catch {}
    logger.error("Process error", { error });
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 });
  }
}
