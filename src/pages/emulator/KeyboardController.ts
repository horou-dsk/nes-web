const KEY_BINDS = ['J', 'K', 'H', 'F', 'W', 'A', 'S', 'D', '', 'U', 'I'];

export default class KeyboardController {

  // B, A, START, SELECT, UP, LEFT, DOWN, RIGHT
  key_state = new Uint8ClampedArray(9);

  private old_key_state = new Uint8ClampedArray(9);

  private turbo_a = false;

  private turbo_b = false;

  constructor(private player: number) {
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
    this.key_state[8] = player
  }

  public keyDown(key: string) {
    this.onKeyDown(new KeyboardEvent('keydown', { key, repeat: false }))
  }

  public keyUp(key: string) {
    this.onKeyUp(new KeyboardEvent('keyup', { key, repeat: false }))
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    if (!KEY_BINDS.includes(key) || event.repeat) return
    this.key_state[KEY_BINDS.indexOf(key)] = 1;
    if (key === 'U') this.turbo_b = true;
    if (key === 'I') this.turbo_a = true;
  }

  private onKeyUp = (event: KeyboardEvent) => {
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    if (!KEY_BINDS.includes(key) || event.repeat) return
    this.key_state[KEY_BINDS.indexOf(key)] = 0;
    if (key === 'U') {
      this.turbo_b = false;
      this.key_state[0] = 0
    }
    if (key === 'I') {
      this.turbo_a = false;
      this.key_state[1] = 0;
    }
  }

  public turbo_clock() {
    if (this.turbo_a) {
      const index = KEY_BINDS.indexOf('K')
      this.key_state[index] = (this.key_state[index] + 1) % 2;
    }
    if (this.turbo_b) {
      const index = KEY_BINDS.indexOf('J')
      this.key_state[index] = (this.key_state[index] + 1) % 2;
    }
  }

  release() {
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
  }

  public syncKeyState(socket: WebSocket) {
    if (this.old_key_state.toString() !== this.key_state.toString()) {
      socket.send(this.key_state.buffer)
    }
    this.old_key_state = this.key_state.slice(0)
  }
}
