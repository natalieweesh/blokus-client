import React, { useState, useEffect, useRef } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import Draggable from 'draggable';
import { tiles } from './tiles';
import dice1 from '../../dice/dice1.png';
import dice2 from '../../dice/dice2.png';
import dice3 from '../../dice/dice3.png';
import dice4 from '../../dice/dice4.png';
import dice5 from '../../dice/dice5.png';
import dice6 from '../../dice/dice6.png';
import Rules from '../Rules/Rules';
import TextContainer from '../TextContainer/TextContainer';
import './Game.css';

let socket;

const Game = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [prevmessages, setPrevMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentGame, setCurrentGame] = useState([]);
  const [newRound, setNewRound] = useState(false);
  const [finishedGame, setFinishedGame] = useState(false);
  const [poop, setPoop] = useState(false);
  const [cards, setCards] = useState(tiles["tiles"]);
  const draggables = useRef([]);
  const [modal, setModal] = useState('');
  const dragging = useRef(false);

  // TODO: change this for prod / dev
  // const ENDPOINT = 'localhost:5000';
  const ENDPOINT = 'https://blokus-app.herokuapp.com/';


  const setTileClass = (x, y, user, tile, animate, rotate) => {
    let className;
    let tileId = tile.element.id;
    // console.log('SET TILE CLASS', tileId, x, y, 'orderindex', user?.orderIndex);

    if (x >= 525 && x < 1225 && y >= 443 && y < 1143 && user) {
      console.log("in no mans land", x, y, user)
      if (rotate && rotate > 0) {
        className = 'item rotate-' + rotate;
      } else {
        className = 'item';
      }
    } else if (user?.orderIndex === 0 && x < 1375 && x >= 375 && y >= 120 && y < 443) {
      console.log("in player 1 zone")
      if (rotate && rotate > 0) {
        className = 'item player-0-private rotate-' + rotate;
      } else {
        className = 'item player-0-private';
      }
    } else if (user?.orderIndex === 1 && x >= 0 && x < 525 && y >= 443 && y < 1143) {
      console.log("in player 2 zone")
      if (rotate && rotate > 0) {
        className = 'item player-1-private rotate-' + rotate;
      } else {
        className = 'item player-1-private';
      }
    } else if (user?.orderIndex === 2 && x >= 1225 && y >= 443 && y < 1143) {
      console.log('in player 3 zone')
      if (rotate && rotate > 0) {
        className = 'item player-2-private rotate-' + rotate;
      } else {
        className = 'item player-2-private';
      }
    } else if (user?.orderIndex === 3 && x >= 375 && x < 1375 && y >= 1143) {
      console.log('in player 4 zone')
      if (rotate && rotate > 0) {
        className = 'item player-3-private rotate-' + rotate;
      } else {
        className = 'item player-3-private';
      }
    } else {
      // if ((x >= 1225 && x <= 1304 && y >= 461 && y <= 1190) || (x >= 405 && x <= 479 && y >= 460 && y <= 1180)) {
      //   className = 'item poop sideways';
      // } else {
        // console.log("got poop")
        className = 'item poop';
      // }      
    }
    console.log('new class name:', className)
    
    // if (animate) {
    //   let oldClassName = className;
    //   document.getElementById(tileId).className = className + ' flash';
    //   const animation = setTimeout(() => {
    //     document.getElementById(tileId).className = oldClassName;
    //     clearTimeout(animation);
    //   }, 750)
    // } else {
      document.getElementById(tileId).className = className;
    // }
  }

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setName(name.trim().toLowerCase());
    setRoom(room.trim().toLowerCase());

    socket.emit('join', { name, room }, ((e) => {
      if (e) {
        window.location.href='/';
        alert(e)
      }
    }));

    return () => {
      socket.emit('disconnect');

      socket.off();
    }

  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.off('roomData').on('roomData', ({ users }) => {
      console.log('Room Data', users)
      setUsers(users);
    })
    socket.off('gameStatus').on('gameStatus', ({ game }) => {
      console.log('Game Status', game);
      if (game && game.cards.length > 0) {
        setCards(game.cards);
        console.log("GAME CARDS?", game.card)
        if (!game.cards[0]["x"]) { // set all the positions
          // red ones first
          for (let i=0; i < 21; i++) {
            let startX = game.cards[i]["startX"];
            let startY = game.cards[i]["startY"];
            draggables.current[i].set(startX, startY);
            let id = draggables.current[i].element.id;
            socket.emit('moveTile', {el: id, x: startX, y: startY, settingUp: users.length > 0 ? users[0] : {orderIndex: 0}}, () => {
              console.log('setting up tile moved', id, startX, startY);
            });
          }
          // green ones next
          for (let i=21; i < 42; i++) {
            let startX = game.cards[i]["startX"];
            let startY = game.cards[i]["startY"];
            draggables.current[i].set(startX, startY);
            let id = draggables.current[i].element.id;
            socket.emit('moveTile', {el: id, x: startX, y: startY, settingUp: users.length > 1 ? users[1] : {orderIndex: 1}}, () => {
              console.log('setting up tile moved', id, startX, startY);
            });
          }

          //then blue
          for (let i=42; i < 63; i++) {
            let startX = game.cards[i]["startX"];
            let startY = game.cards[i]["startY"];
            draggables.current[i].set(startX, startY);
            let id = draggables.current[i].element.id;
            socket.emit('moveTile', {el: id, x: startX, y: startY, settingUp: users.length > 2 ? users[2] : {orderIndex: 2}}, () => {
              console.log('setting up tile moved', id, startX, startY);
            });
          }

          //then yellow
          for (let i=63; i < 84; i++) {
            let startX = game.cards[i]["startX"];
            let startY = game.cards[i]["startY"];
            draggables.current[i].set(startX, startY);
            let id = draggables.current[i].element.id;
            socket.emit('moveTile', {el: id, x: startX, y: startY, settingUp: users.length > 3 ? users[3] : {orderIndex: 3}}, () => {
              console.log('setting up tile moved', id, startX, startY);
            });
          }
        } else {
          console.log('setting locations from memory')
          game.cards.forEach((card) => {
            let tile = draggables.current.find((d) => d.element.id === card.id);
            tile.set(card.x, card.y);
            setTileClass(card.x, card.y, card.user, tile, false, card.rotation);
          })
        }
      }

      if (currentGame.length === 0 && !!game) {
        setCurrentGame(game);
        if (newRound !== game.newRound) {
          setNewRound(game.newRound)
        }
        setFinishedGame(game.finishedGame)
      }
    })
    socket.off('gameRestarted').on('gameRestarted', ({ users }) => {
      setFinishedGame(false)
      setNewRound(false)
      setUsers(users);
      setCurrentGame([])
    })
    socket.off('tileMoved').on('tileMoved', ({el, x, y, user, settingUp, rotate}) => {
      // console.log('received tilemoved', el, x, y, user);
      const tile = draggables.current.filter((e) => e.element.id === el)[0];
      setTileClass(x, y, user, tile, true, rotate);
      tile.set(x, y);
    })

    document.querySelectorAll('.item').forEach((el) => {
      draggables.current.push(new Draggable(el, {
        onDragStart: (el, x, y, event) => {
          dragging.current = true;
        },
        onDragEnd: (el, x, y, event) => {
          socket.emit('moveTile', {el: el.id, x, y, settingUp: false}, () => {
            console.log('tile moved on Drag End!', el.id, x, y);
            dragging.current = false;
          })
        },
        grid: 35,
        threshhold: 3
      }));
    });
    // scatter the tiles!
    draggables.current.forEach((d) => {
      const randX = 360 + Math.floor(Math.random() * 980);
      const randY = 480 + Math.floor(Math.random() * 680);
      d.set(randX, randY);
    })
    console.log('dragagbles are now', draggables.current)
  }, [])

  useEffect(() => {
    socket.off('disconnect').on('disconnect', () => {
      // if(!alert('ack! you have been disconnected!')){window.location.reload();}
      // if(!alert('ack youve been disconnected')){setPoop(true)}
      setPoop(true);
      const reconnectFrontEnd = () => {
        const { name, room } = queryString.parse(location.search);
        socket.connect()
        socket.emit('frontEndReconnect', {name, room}, () => {
        })
        socket.emit('join', { name, room }, ((e) => {
          if (e) {
            window.location.href='/';
            alert(e)
          }
        }));
        document.removeEventListener('click', reconnectFrontEnd)
        document.removeEventListener('visibilitychange', reconnectFrontEndVisible);
      }
      document.addEventListener('click', reconnectFrontEnd)

      const reconnectFrontEndVisible = () => {
        const { name, room } = queryString.parse(location.search);
        if (document.visibilityState && document.visibilityState === 'visible') {
          socket.connect()
          socket.emit('frontEndReconnect', {name, room}, () => {
          })
          socket.emit('join', { name, room }, ((e) => {
            if (e) {
              window.location.href='/';
              alert(e)
            }
            document.removeEventListener('visibilitychange', reconnectFrontEndVisible);
          })); 
          document.removeEventListener('visibilitychange', reconnectFrontEndVisible);
          document.removeEventListener('click', reconnectFrontEnd)
        }
      }
      document.addEventListener('visibilitychange', reconnectFrontEndVisible)
    })
  })

  useEffect(() => {
    socket.off('message').on('message', ({user, message, messages}) => {
      if (message && prevmessages) {
        setPrevMessages([...prevmessages, {user, text: message}]);
      } else if (message && messages) {
        setPrevMessages([...messages, {user, text: message}]);
      }
    })
  }, [prevmessages])

  useEffect(() => {
    socket.off('startGame').on('startGame', ({ users }) => {
      socket.emit('initiateGame', {cards: tiles["tiles"]}, () => {
        console.log("INITIATED GAME")
        socket.emit('fetchGame', () => {
        })
      })
    })
  }, [currentGame, setCurrentGame])

  const restartGame = (event) => {
    event.preventDefault();
    socket.emit('restartGame', () => {
      socket.emit('fetchGame', () => {
      })
    })
  }

  const getDicePic = (num) => {
    switch(num) {
      case 1:
        return dice1;
      case 2:
        return dice2;
      case 3:
        return dice3;
      case 4:
        return dice4;
      case 5:
        return dice5;
      case 6:
        return dice6;
    }
  }

  const updateUserStatus = (event) => {
    event.preventDefault();

    socket.emit('setReadyToPlay', () => {
    })
  }

  const userRestart = (event) => {
    event.preventDefault();

    socket.emit('setReadyToRestart', {cards: tiles["tiles"]}, () => {
    })
  }

  const rotateCard = (target) => {
    console.log('on click! dragging?', target, dragging.current)
    if (dragging.current) {
      dragging.current = false;
      return;
    }
    if (!dragging.current && target.nodeName === 'P') {
      const id = target.id;
      if (document.getElementById(id)) {
        const startX = document.getElementById(id).offsetLeft;
        const startY = document.getElementById(id).offsetTop;
        socket.emit('moveTile', {el: id, x: startX, y: startY, settingUp: false, rotate: true}, () => {
          console.log('done rotating')
        }); 
      }
      dragging.current = false;
    } else if (!dragging.current && (target.nodeName === 'DIV' || target.nodeName === 'SPAN')) {
      const id = target.parentNode.id ? target.parentNode.id : target.parentNode.parentNode.id;
      if (document.getElementById(id)) {
        const startX = document.getElementById(id).offsetLeft;
        const startY = document.getElementById(id).offsetTop;
        socket.emit('moveTile', {el: id, x: startX, y: startY, settingUp: false, rotate: true}, () => {
          console.log('done rotating parent')
        }); 
      }
      dragging.current = false;
    }
  }

  const getLayout = (layout) => {
    switch(layout) {
      case "one-1":
        return <span className="unit"></span>
      case "two-1":
        return <><span className="unit"></span><span className="unit"></span></>
      case "three-1":
        return <><span className="unit"></span><span className="unit"></span><span className="unit"></span></>
      case "three-2":
        return <><span className="unit left"></span><div><span className="unit"></span><span className="unit"></span></div></>
      case "four-1":
        return <><span className="unit right"></span><span className="unit right"></span><div><span className="unit"></span><span className="unit"></span></div></>
      case "four-2":
        return <><div><span className="unit"></span><span className="unit"></span></div><div><span className="unit"></span><span className="unit"></span></div></>
      case "four-3":
        return <><span className="unit left"></span><div><span className="unit"></span><span className="unit"></span></div><span className="unit right"></span></>
      case "four-4":
        return <><div><span className="unit"></span><span className="unit"></span><span className="unit"></span><span className="unit"></span></div></>
      case "four-5":
        return <><span className="unit center"></span><div><span className="unit"></span><span className="unit"></span><span className="unit"></span></div></>
      case "five-1":
        return <><span className="unit"></span><span className="unit"></span><span className="unit"></span><span className="unit"></span><span className="unit"></span></>
      case "five-2":
        return <><div><span className="unit"></span><span className="unit"></span></div><span className="unit left"></span><div><span className="unit"></span><span className="unit"></span></div></>
      case "five-3":
        return <><span className="unit center"></span><span className="unit center"></span><div><span className="unit"></span><span className="unit"></span><span className="unit"></span></div></>
      case "five-4":
        return <><span className="unit center"></span><div><span className="unit"></span><span className="unit"></span><span className="unit"></span></div><span className="unit center"></span></>
      case "five-5":
        return <><span className="unit left"></span><span className="unit left"></span><div><span className="unit"></span><span className="unit"></span></div><span className="unit right"></span></>
      case "five-6":
        return <><span className="unit move-left-1"></span><div><span className="unit"></span><span className="unit"></span><span className="unit"></span><span className="unit"></span></div></>
      case "five-7":
        return <><div><span className="unit"></span><span className="unit"></span></div><div className="move-right-1"><span className="unit"></span><span className="unit"></span></div><span className="unit right"></span></>
      case "five-8":
        return <><div><span className="unit"></span><span className="unit"></span></div><div><span className="unit"></span><span className="unit"></span></div><span className="unit"></span></>
      case "five-9":
        return <><div><span className="unit"></span><span className="unit"></span><span className="unit"></span><span className="unit"></span></div><span className="unit"></span></>
      case "five-10":
        return <><span className="unit right"></span><div><span className="unit"></span><span className="unit"></span><span className="unit"></span></div><span className="unit center"></span></>
      case "five-11":
        return <><span className="unit left"></span><span className="unit left"></span><div><span className="unit"></span><span className="unit"></span><span className="unit"></span></div></>
      case "five-12":
        return <><div><span className="unit"></span><span className="unit"></span></div><span className="unit center"></span><div className="move-right-1"><span className="unit"></span><span className="unit"></span></div></>
      default:
        return <span className="unit"></span>
    }
  }

  const user = users.find((user) => user.name === name);
  console.log("USER", user);
  console.log('current game', currentGame)
  const myTurn = currentGame.currentRound === user?.orderIndex;
  console.log('my turn?', myTurn)
  return (
    <div className={`player-${user?.orderIndex} outerContainer ${currentGame.finishedGame && 'revealAll'}`}>
      <div className="sideContainer">
        {poop ? <div className="modal"><div className="attentionModal">Hey! Pay attention to the game!<button className="button" onClick={() => {setPoop(false)}}>Ok</button></div></div> : null}
        {(currentGame.length === 0 || finishedGame) && <TextContainer users={users} user={user} game={currentGame} finishedGame={finishedGame} />}
        {currentGame.length === 0 && users.length > 1 && <button className="startButton" disabled={user?.readyToPlay} onClick={updateUserStatus}>{user?.readyToPlay ? 'Waiting for other players' : 'Ready to play!'}</button>}
        {finishedGame && <div><button className="startButton" disabled={user?.readyToRestart} onClick={userRestart}>{user?.readyToRestart ? 'Waiting for other players' : 'Play again!'}</button></div>}
        <p className="note">** Click on a piece to turn/flip it! **</p>

        {currentGame.length !== 0 && (
          <>
            <div className="diceContainer">
              <span>Click the dice to roll 'em:</span>
              <button id='rollDice' className='dice' onClick={() => {
                document.getElementById('rollDice').className = 'dice shrink';
                setTimeout(() => {
                  document.getElementById('rollDice').className = 'dice';
                }, 1000)
                socket.emit('rollDice', () => {})
              }}>{currentGame.dice && <><img src={getDicePic(currentGame.dice[0])} alt="dice-1"/><img src={getDicePic(currentGame.dice[1])} alt="dice-2"/></>}</button>
          </div>
          {!finishedGame && <button className="endGame" onClick={() => {
            const endIt = window.confirm('Are you sure you want to end the game?');
            if (endIt) {
              socket.emit('showAllTiles', () => {
                console.log('now show all tiles')
              })
            }
          }}>Click here to end the game and reveal all the tiles!</button>}
          </>
        )}
        <button className="rulesButton" onClick={() => setModal('rules')}>Check the rule book</button>
        {modal && <div className="modal">
          <button className="button closeModal" onClick={(e) => {
            e.preventDefault();
            setModal('');
          }}>X</button>
          {modal === 'rules' ? <Rules /> : null}
          
        </div>}
      </div>
      <div className="mah-jong-board">
      <div className="player-space player-0">
        {users.length > 0 && <p>Player one: {users[0].name}</p>}
      </div>
      <div className="second-row">
      <div className="player-space player-1">
        {users.length > 1 && <p>Player two: {users[1].name}</p>}
      </div>
      <div className="square dropzone">
        {cards.map((t) => <div className="item" key={t.id} id={t.id} data-layout={t.layout} data-color={t.color} onClick={(e) => {
          rotateCard(e.target);
        }} onTouchEnd={(e) => {
          rotateCard(e.target);
        }}>{getLayout(t.layout)}</div>)}
      </div>
      <div className="player-space player-2">
        {users.length > 2 && <p>Player three: {users[2].name}</p>}
      </div>
      </div>
      <div className="player-space player-3">
        {users.length > 3 && <p>Player four: {users[3].name}</p>}
      </div>
      </div>
    </div>
  )   
}

export default Game;