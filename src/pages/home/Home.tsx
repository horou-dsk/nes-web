import React, { useEffect, useRef, useState } from 'react'
import { createRoom, joinRoom } from '../../api/nes'
import styles from './home.module.css'
import nes from './nes.json'

function Home() {
  const [gamePath, setGamePath] = useState('')

  const [gameName, setGameName] = useState('');

  const [scrollBtn, setScrollBtn] = useState(false);

  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    box.addEventListener('scroll', (event) => {
      const target = event.target as HTMLDivElement;
      setScrollBtn(target.scrollTop > 300);
    });
  }, [boxRef])

  const handleCreateRoom = () => {
    createRoom(gamePath).then(res => {
      window.location.assign(`/nes?rom=${gamePath}&room=${res.data}&player=1`)
    })
  }

  const handleJoinRoom = () => {
    let inp = document.getElementById('room_num') as HTMLInputElement;
    joinRoom(inp.value).then(res => {
      const {game, room_id, player} = res.data;
      window.location.assign(`/nes?rom=${game}&room=${room_id}&player=${player}`)
    })
  }

  return (
    <div className={styles.container} ref={boxRef}>
      <div className={styles.main}>
        <div className={styles.box}>
          <div className="nes-field" style={{ margin: '20px 0 20px 0' }}>
            <label htmlFor="name_field">Game name</label>
            <div className={styles.search}>
              <input
                type="text" id="name_field" className={['nes-input is-success', styles.search_input].join(' ')}
                onInput={(event) => {
                  setGameName(event.currentTarget.value)
                }}
              />
              <button
                className={['nes-btn is-primary', styles.join_btn].join(' ')}
                onClick={() => {
                  (document.getElementById('dialog-dark') as HTMLDialogElement).showModal()
                }}
              >
                Join Room
              </button>
            </div>
          </div>
          <div className={["nes-container is-dark with-title", styles.gameList].join(' ')}>
            <div className="title">GAMES</div>
            {Object.entries(nes).map(([name, path]) => (!gameName || name.toLowerCase().includes(gameName.toLowerCase())) ? (
              <button key={name} onClick={() => {
                setGamePath(path);
                (document.getElementById('create-room-dialog') as HTMLDialogElement).showModal()
              }} type="button" className={[styles.gameItem, "nes-btn"].join(' ')}>{name}</button>
            ) : null)}
          </div>
        </div>
        {/*{game_path && <Emulator path={game_path} />}*/}
      </div>
      <dialog className="nes-dialog is-dark" id="dialog-dark">
        <form method="dialog">
          <p className="title">Join Room</p>
          <label htmlFor="room_num">Room Number</label>
          <input
            type="text" id="room_num" className={'nes-input is-success'}
          />
          <menu className={['dialog-menu', styles.dialog_menu].join(' ')}>
            <button className="nes-btn">Cancel</button>
            <button className="nes-btn is-primary" onClick={handleJoinRoom}>Confirm</button>
          </menu>
        </form>
      </dialog>
      <dialog className="nes-dialog is-dark" id="create-room-dialog">
        <form method="dialog">
          <p className="title">Game Start</p>
          <p>Is Online</p>
          <menu className={['dialog-menu', styles.dialog_menu].join(' ')}>
            <button className="nes-btn is-primary" onClick={handleCreateRoom}>Create Room</button>
            {'\u3000\u3000'}
            <button
              className="nes-btn is-success"
              onClick={() => window.location.assign(`/nes?rom=${gamePath}&player=1`)}
            >Single</button>
          </menu>
        </form>
      </dialog>
      <div className={scrollBtn ? [styles.scrollTop, 'active'].join(' ') : styles.scrollTop}>
        <button onClick={() => {
          boxRef.current?.scrollTo({ top:0, behavior: 'smooth' });
        }} type="button" className="nes-btn is-error active"><span>&lt;</span></button>
      </div>
    </div>
  )
}

export default Home
