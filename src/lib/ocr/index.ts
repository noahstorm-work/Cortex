let worker: any = null;
import { logger } from "@/lib/logger";

async function getWorker() {
  if (!worker) {
    const { createWorker } = await import("tesseract.js");
    worker = await createWorker("eng");
  }
  return worker;
}

export async function ocrImage(buffer: Buffer): Promise<string> {
  const w = await getWorker();
  const { data } = await w.recognize(buffer);
  return data.text;
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;

  const pageTexts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(" ");
    pageTexts.push(`--- Page ${i} ---\n${text}`);
  }

  return pageTexts.join("\n\n");
}

async function ocrPDFviaSVG(buffer: Buffer): Promise<string> {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM("<!DOCTYPE html>", { pretendToBeVisual: true });

  const origDoc = (globalThis as any).document;
  const origDOMMatrix = (globalThis as any).DOMMatrix;
  const origXMLSerializer = (globalThis as any).XMLSerializer;
  (globalThis as any).document = dom.window.document;
  (globalThis as any).DOMMatrix = dom.window.DOMMatrix;
  (globalThis as any).XMLSerializer = dom.window.XMLSerializer;

  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const sharpMod = await import("sharp");
    const s = sharpMod.default || sharpMod;
    const w = await getWorker();
    const pageTexts: string[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      const opList = await page.getOperatorList();
      const svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
      svgGfx.embedFonts = true;
      const svg = await svgGfx.getSVG(opList, viewport);

      const serializer = new dom.window.XMLSerializer();
      const svgStr = serializer.serializeToString(svg as any);

      const pngBuf = await s(Buffer.from(svgStr)).png().toBuffer();
      const { data } = await w.recognize(pngBuf);
      pageTexts.push(`--- Page ${i} ---\n${data.text}`);
    }

    return pageTexts.join("\n\n");
  } finally {
    (globalThis as any).document =
      origDoc(globalThis as any).DOMMatrix =
      origDOMMatrix(globalThis as any).XMLSerializer =
        origXMLSerializer;
  }
}

export async function ocrPDF(buffer: Buffer): Promise<string> {
  const text = await extractTextFromPDF(buffer);
  if (text.trim().length >= 50) return text;

  try {
    return await ocrPDFviaSVG(buffer);
  } catch (e) {
    logger.warn("PDF OCR via SVG failed", { error: e });
    return text;
  }
}
