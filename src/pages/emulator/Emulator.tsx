import React, { useEffect, useRef, useState } from 'react'
import ThreeScreen from '../../components/three-screen/ThreeScreen'
import { urlQuery } from '../../utils/utils'
import Game from './Game'
import styles from './emulator.module.css'
import Online from './Online'
import KeyboardController from "./KeyboardController";
import VirtualKey from "./VirtualKey";
import CanvasScreen from "./CanvasScreen";

function Emulator() {

  const initRef = useRef(false);
  const loading = useRef(false);

  const glScreen = useRef<{ render: (imageData: Uint8ClampedArray) => void }>()

  const [fps, setFps] = useState(0)

  const {rom, player, room} = urlQuery()

  const [controller] = useState(new KeyboardController(Number(player) ?? 1))

  const sUserAgent = navigator.userAgent

  const [isPhone] = useState(sUserAgent.indexOf('Android') > -1 || sUserAgent.indexOf('iPhone') > -1 || sUserAgent.indexOf('iPad') > -1 || sUserAgent.indexOf('iPod') > -1 || sUserAgent.indexOf('Symbian') > -1)

  const init = async () => {
    if (!loading.current || initRef.current) return () => {};
    const res = await fetch('/roms/' + rom);
    const buffer = await res.arrayBuffer();
    const game = await Game.new(new Uint8Array(buffer));
    const online = new Online(game, ({fps, imageData}) => {
      setFps(fps)
      glScreen.current?.render(imageData)
    }, controller, room)
    return () => {
      online.drop()
    }
  }
  useEffect(() => {
    // 禁止ios10双指缩放
    let gesturestart = function(event: any) {
      event.preventDefault()
    };
    document.addEventListener('gesturestart', gesturestart);
    let unMounted = () => {}
    loading.current = true;
    let timer = setTimeout(() => {
      init().then((res) => {
        initRef.current = true;
        console.log('Loading Success!')
        unMounted = res
      });
    }, 10);
    return () => {
      loading.current = false;
      initRef.current = false;
      clearTimeout(timer);
      unMounted()
      document.removeEventListener('gesturestart', gesturestart);
    }
  }, [])
  return (
    <div className={styles.main}>
      {isPhone ? <div className={styles.phoneScreen}><CanvasScreen ref={glScreen} /></div> : <ThreeScreen ref={glScreen} />}
      <div className={styles.fps}>FPS: {fps}{'\u3000\u3000'}{room ? `Room：${room}` : ''}</div>
      {isPhone && <VirtualKey controller={controller} />}
    </div>
  )
}

export default Emulator
