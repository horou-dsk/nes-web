import { WasmNes as Nes } from '../../nes-wasm'

export default class GameAudio {

  audioTime = 0;

  private audioCtx: AudioContext

  private audioEnabled = false

  private oldAudioSource: AudioBufferSourceNode | undefined

  constructor(private nes: Nes) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContext({ sampleRate: 44100 });
    const bufferLength = 4096;
    const scriptProcessor = this.audioCtx.createScriptProcessor(bufferLength, 0, 1);
    scriptProcessor.addEventListener('audioprocess', e => {
      const data = e.outputBuffer.getChannelData(0);
      this.nes.update_sample_buffer(data);

      for (let i = 0; i < data.length; i++) {
        data[i] *= 0.25;
      }
    })
    scriptProcessor.connect(this.audioCtx.destination);
  }

  toggleAudio() {
    if (!this.audioCtx.currentTime) {
      this.audioCtx.resume();
    }
    // this.audioEnabled = !this.audioEnabled;
  }
}
