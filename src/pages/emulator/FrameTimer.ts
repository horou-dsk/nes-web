const FPS = 60.098;

export default class FrameTimer {

  private readonly interval = 1e3 / FPS

  private request_id = 0;

  private lastFrameTime = 0

  private interval_timer = 0;

  constructor(private onGenerateFrame: () => void) {
  }

  public start() {
    this.requestAnimationFrame()
  }

  public stop() {
    if (this.request_id) window.cancelAnimationFrame(this.request_id);
    window.clearInterval(this.interval_timer);
    this.lastFrameTime = 0;
  }

  private requestAnimationFrame() {
    // let start = performance.now();
    // this.interval_timer = setInterval(() => {
    //   let time = performance.now() - start
    //   this.onAnimationFrame(time)
    // }, 1e3 / 59) as unknown as number;
    this.request_id = window.requestAnimationFrame((time) => {
      this.requestAnimationFrame();
      this.onAnimationFrame(time);
    })
  }

  private generateFrame() {
    this.onGenerateFrame();
    this.lastFrameTime += this.interval;
  }

  private onAnimationFrame = (time: number) => {
    const excess = time % this.interval;

    const newFrameTime = time - excess;

    if (!this.lastFrameTime) {
      this.lastFrameTime = newFrameTime;
      return;
    }

    const numFrames = Math.round(
      (newFrameTime - this.lastFrameTime) / this.interval
    )

    if (numFrames === 0) {
      return;
    }

    this.generateFrame();

    // for (let i = 1; i < numFrames; i++) {
    //   this.generateFrame();
    // }
  }
}
