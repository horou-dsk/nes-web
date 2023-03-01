export default class Fps {
  frames: number[] = []

  fps = 0

  lastFrameTimeStamp = performance.now();

  public tick() {
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = 1 / delta * 1000;

    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    let min = Infinity;
    let max = Infinity;
    let sum = this.frames.reduce((acc, val) => {
      acc += val;
      min = Math.min(val, min);
      max = Math.max(val, max);
      return acc;
    });
    let mean = sum / this.frames.length;

    this.fps = Math.round(mean)
  }
}
