let pipeline: any = null
let transcriber: any = null
let modelLoading = false
let modelLoaded = false

export function getTranscriberStatus() {
  return { loading: modelLoading, loaded: modelLoaded }
}

export async function loadTranscriber() {
  if (modelLoaded) return
  if (modelLoading) {
    while (modelLoading) {
      await new Promise((r) => setTimeout(r, 200))
    }
    return
  }
  modelLoading = true
  try {
    const mod = await import("@xenova/transformers")
    pipeline = mod.pipeline
    transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en")
    modelLoaded = true
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
  const result = await transcriber(audioData, { language: "english" })
  return (result as { text: string }).text
}
