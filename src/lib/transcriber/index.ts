let pipeline: any = null
let transcriber: any = null
let modelLoading = false
let modelLoaded = false
let modelProgress = 0
let modelStatus = ""

export function getTranscriberStatus() {
  return { loading: modelLoading, loaded: modelLoaded, progress: modelProgress, status: modelStatus }
}

export async function loadTranscriber(progressCallback?: (pct: number) => void) {
  if (modelLoaded) return
  if (modelLoading) {
    while (modelLoading) {
      await new Promise((r) => setTimeout(r, 200))
    }
    return
  }
  modelLoading = true
  modelProgress = 0
  modelStatus = "Loading library..."
  try {
    console.log("[Transcriber] loading module...")
    const mod: any = await eval(`import("/wasm/transformers.min.js")`)
    pipeline = mod.pipeline
    modelStatus = "Downloading speech model..."
    console.log("[Transcriber] creating pipeline...")
    transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en", {
      quantized: true,
      progress_callback: (progress: any) => {
        if (progress.status === "progress" && progress.total > 0) {
          const pct = Math.round((progress.loaded / progress.total) * 100)
          modelProgress = pct
          progressCallback?.(pct)
        }
      },
    })
    modelProgress = 100
    console.log("[Transcriber] pipeline ready")
    modelLoaded = true
    modelStatus = ""
  } catch (e) {
    console.error("[Transcriber] load failed:", e)
    modelStatus = "Failed to load"
    throw e
  } finally {
    modelLoading = false
  }
}

export async function transcribeAudioChunks(chunks: Float32Array[]): Promise<string> {
  if (!modelLoaded) {
    await loadTranscriber()
  }
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0)
  const audioData = new Float32Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    audioData.set(chunk, offset)
    offset += chunk.length
  }
  console.log("[Transcriber] transcribing", totalLength, "samples...")
  const result = await transcriber(audioData, { language: "english" })
  console.log("[Transcriber] result:", result)
  return (result as { text: string }).text
}
