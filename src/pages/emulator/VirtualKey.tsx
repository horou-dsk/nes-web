import React, {TouchEventHandler, useRef, useState} from 'react'
import styles from './virtual_key.module.css'
import KeyboardController from "./KeyboardController";

const DISC_LEFT = 30, DISC_TOP = 25, DISC_SIZE = 150

interface VirtualKeyProps {
    controller: KeyboardController
}

function VirtualKey(props: VirtualKeyProps) {

    const { controller } = props;

    const joystick = useRef<HTMLDivElement | null>(null)

    const [{x, y}, setXy] = useState({x: 0, y: 0})

    const handleTouchMove: TouchEventHandler = (event) => {
        for (let index = 0; index < event.touches.length; index++) {
            const touch = event.touches[index]
            if (touch.pageY >= document.body.clientHeight / 2) {
                continue
            }
            const size = DISC_SIZE / 2
            const x = touch.pageY - DISC_TOP - size
            const y = touch.pageX - DISC_LEFT - size
            const angle = Math.atan2(y, x)
            const wz = angle / Math.PI * 180
            const _size = Math.min(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), size)
            setXy({x: Math.cos(angle) * _size, y: Math.sin(angle) * _size})
            controller.keyUp('A');
            controller.keyUp('W');
            controller.keyUp('S');
            controller.keyUp('D');
            if (_size < size / 3.4) return
            if (wz < 30 && wz > -30) {
                // 右
                controller.keyDown('D')
            } else if (wz > 30 && wz < 60) {
                // 右上
                controller.keyDown('D')
                controller.keyDown('W')
            } else if (wz > 60 && wz < 120) {
                // 上
                controller.keyDown('W')
            } else if (wz > 120 && wz < 150) {
                // 左上
                controller.keyDown('W')
                controller.keyDown('A')
            } else if (wz > 150 || wz < -150) {
                // 左
                controller.keyDown('A')
            } else if (wz > -150 && wz < -120) {
                // 左下
                controller.keyDown('A')
                controller.keyDown('S')
            } else if (wz > -120 && wz < -60) {
                // 下
                controller.keyDown('S')
            } else if (wz > -60 && wz < -30) {
                // 右下
                controller.keyDown('S')
                controller.keyDown('D')
            }
            break;
        }
    }

    const handleTouchEnd: TouchEventHandler = (_event) => {
        controller.keyUp('A');
        controller.keyUp('W');
        controller.keyUp('S');
        controller.keyUp('D');
        setXy({x: 0, y: 0})
    }

    const handleKey = (key: string, down: boolean) => () => {
        if (down) {
            controller.keyDown(key)
        } else {
            controller.keyUp(key)
        }
        // onChange(key_state)
    }

    const handleAb = (down: boolean) => () => {
        if (down) {
            controller.keyDown('J')
            controller.keyDown('K')
        } else {
            controller.keyUp('J')
            controller.keyUp('K')
        }
        // onChange(key_state)
    }

    return (
        <div className={styles.main}>
            <div
                onTouchMove={handleTouchMove}
                onTouchStart={handleTouchMove}
                onTouchCancel={handleTouchEnd}
                onTouchEnd={handleTouchEnd}
                className={styles.disc}
            >
                <div style={{transform: `translate(${y}px, ${x}px)`}} className={styles.joystick} ref={joystick} />
            </div>
            <div onTouchStart={() => {
                controller.keyDown('H')
            }} onTouchEnd={() => {
                controller.keyUp('H')
            }} className={styles.start}>开始</div>
            <div
                onTouchStart={() => {
                    controller.keyDown('F')
                }}
                onTouchEnd={() => {
                    controller.keyUp('F')
                    // onChange(key_state)
                }}
                className={styles.select}
            >选择</div>
            <div
                onTouchStart={handleKey('U', true)}
                onTouchEnd={handleKey('U', false)}
                className={styles.turboB}
            >
                B
            </div>
            <div
                onTouchStart={handleKey('I', true)}
                onTouchEnd={handleKey('I', false)}
                className={styles.turboA}
            >
                A
            </div>
            <div
                onTouchStart={handleKey('J', true)}
                onTouchEnd={handleKey('J', false)}
                className={styles.B}
            >
                B
            </div>
            <div
                onTouchStart={handleKey('K', true)}
                onTouchEnd={handleKey('K', false)}
                className={styles.A}
            >
                A
            </div>
            <div
                onTouchStart={handleAb(true)}
                onTouchEnd={handleAb(false)}
                className={styles.AB}>
                AB
            </div>
        </div>
    )
}

export default VirtualKey
