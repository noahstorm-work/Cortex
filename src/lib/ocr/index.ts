let worker: any = null

async function getWorker() {
  if (!worker) {
    const { createWorker } = await import("tesseract.js")
    worker = await createWorker("eng")
  }
  return worker
}

export async function ocrImage(buffer: Buffer): Promise<string> {
  const w = await getWorker()
  const { data } = await w.recognize(buffer)
  return data.text
}

export async function ocrPDF(buffer: Buffer): Promise<string> {
  const sharpMod = await import("sharp")
  const s = sharpMod.default || sharpMod
  const pdf = s(buffer)
  const metadata = await pdf.metadata()
  const pages = metadata.pages || 1

  const w = await getWorker()
  const pageTexts: string[] = []

  for (let i = 0; i < pages; i++) {
    const pageBuffer = await s(buffer, { page: i })
      .png()
      .toBuffer()

    const { data } = await w.recognize(pageBuffer)
    pageTexts.push(`--- Page ${i + 1} ---\n${data.text}`)
  }

  return pageTexts.join("\n\n")
}
