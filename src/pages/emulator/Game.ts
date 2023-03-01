import { WasmNes as Nes } from '../../nes-wasm'
import Fps from './Fps'
import GameAudio from './GameAudio'

export type GameEvent = {
  key: string,
  pressed: boolean,
  repeat: boolean,
  player: number,
}

export default class Game {

  private gameAudio: GameAudio;

  public imageData = new Uint8ClampedArray(245760);

  public fps = new Fps();

  events: GameEvent[] = [];

  public static async new(rom: Uint8Array) {
    const {default: init, WasmNes} = await import('../../nes-wasm');
    // console.log(init);
    await init();
    // Nes.init()
    return new Game(rom, WasmNes.new())
  }

  constructor(rom: Uint8Array, private nes: Nes) {
    this.nes.set_rom(rom);
    this.gameAudio = new GameAudio(this.nes);
    this.nes.bootup();
    const fn = () => {
      this.gameAudio.toggleAudio();
      window.removeEventListener('click', fn)
    }
    window.addEventListener('click', fn)
  }

  private render() {

  }

  public pause() {
    // this.nes.pause(true)
  }

  public resume() {
    // this.nes.pause(false)
  }

  public paused() {
    // return this.nes.paused();
  }

  public frame() {
    // this.handleEvents();
    this.fps.tick();
    this.nes.step_frame();
    this.nes.update_pixels(this.imageData as unknown as Uint8Array)
    this.render();
  }

  private handleEvents() {
    this.events.splice(0).forEach(e => {
      // this.nes.handle_event(e.key, e.pressed, e.repeat, e.player);
    })
  }

  public handleKeyState(state: Uint8Array) {
    this.nes.handle_key_state(state)
  }

  public addEvent(event: GameEvent) {
    this.events.push(event)
  }
}
