class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
  }

  process(inputs, _, _params) {
    const input = inputs[0]
    if (input && input.length > 0) {
      const channelData = input[0]
      this.port.postMessage(channelData.slice())
    }
    return true
  }
}

registerProcessor("audio-capture-processor", AudioCaptureProcessor)
