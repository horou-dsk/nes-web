import FrameTimer from './FrameTimer'
import Game from './Game'
import KeyboardController from './KeyboardController'

export type OnFrameData = {
  fps: number
  imageData: Uint8ClampedArray
}

const MIN_BUFFER_SIZE = 1
const MAX_BUFFER_SIZE = 1

export default class Online {

  private socket: WebSocket | undefined

  private frameTimer: FrameTimer

  private running = false

  private isBuffering = false

  private key_buffers: Uint8Array[][] = []

  constructor(private game: Game, private onFrame: (data: OnFrameData) => void, private controller: KeyboardController, room?: string) {
    if (room) {
      console.log(`room = ${room}`)
      this.frameTimer = new FrameTimer(this.onlineFrame)
      this.socket = new WebSocket(process.env.REACT_APP_WSS_URL + '/ws?room=' + room)
      this.socket.addEventListener('open', this.onOpen);
      this.socket.addEventListener('message', this.onMessage);
      this.socket.addEventListener('close', this.onClose);
    } else {
      this.frameTimer = new FrameTimer(this.frame)
      this.running = true;
      this.frameTimer.start();
    }
  }

  private onlineFrame = () => {
    if (!this.socket) return
    this.controller.turbo_clock();
    this.controller.syncKeyState(this.socket);

    if (this.key_buffers.length < MIN_BUFFER_SIZE) {
      this.isBuffering = true
      return
    }

    if (this.key_buffers.length > MAX_BUFFER_SIZE) {
      const len = this.key_buffers.length - MAX_BUFFER_SIZE
      for (let i = 0; i < len; i++) {
        this.runFrame()
      }
    }

    if (this.isBuffering && this.key_buffers.length < MAX_BUFFER_SIZE) return
    else this.runFrame()
  }

  private runFrame() {
    const key_states = this.key_buffers.shift()
    key_states?.forEach(state => this.game.handleKeyState(state))
    this.game.frame()
    this.onFrame({
      fps: this.game.fps.fps,
      imageData: this.game.imageData
    })
  }

  private frame = () => {
    this.controller.turbo_clock()
    this.game.handleKeyState(new Uint8Array(this.controller.key_state))
    this.game.frame()
    this.onFrame({
      fps: this.game.fps.fps,
      imageData: this.game.imageData
    })
  }

  public drop() {
    this.running = false
    this.controller.release()
    this.frameTimer.stop()
    this.socket?.close()
  }

  private onOpen = () => {
    console.log('websocket 连接成功！');
  }

  private onMessage = (data: MessageEvent) => {
    if (data.data instanceof Blob) {
      (data.data as Blob).arrayBuffer().then(buffer => {
        const keys = new Uint8Array(buffer)
        let arr = []
        for (let i = 0; i < keys.length; i += 9) {
          arr.push(keys.slice(i, i + 9))
        }
        this.key_buffers.push(arr)
      })
      return
    }
    let message = JSON.parse(data.data)
    if (typeof message === 'string') {
      switch (message) {
        case 'GameReady': {
          if (this.running) return;
          this.running = true
          console.log('开始！！！！！')
          this.frameTimer.start();
        }
      }
    }
    // switch (message.match) {
    //
    // }
  }

  private onClose = () => {
    console.log('websocket 断开连接！');
  }
}
