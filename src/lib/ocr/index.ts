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
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf")
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise

  const pageTexts: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((item: any) => item.str).join(" ")
    pageTexts.push(`--- Page ${i} ---\n${text}`)
  }

  return pageTexts.join("\n\n")
}
