import React, { Component } from 'react'
import './index.css';
import io from "socket.io-client";
import  Game from './game';

let socket;
let soundCoin = './sounds/coin.mp3';
let soundCoinRoom = './sounds/coin-02.mp3';

class Chat extends Component{
  constructor(props){
    super(props);
    this.sendMessage = this.sendMessage.bind(this);
    this.login = this.login.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);

    this.state = {
      /*endpoint: "localhost:8000",*/  //Local
      endpoint: undefined, //Heroku
      username: '',
      playerOne: '',
      playerTwo: '',
      playerNumberOne: false,
      message:'', //sert à communiquer avec le serveur
      messages: [], //ensemble des messages reçus du serveur
      session: false, //boolean pour switch l'opérateur ternaire
      room: '', // sert à communiquer avec le serveur
      rooms:[], //ensemble des rooms existantes reçues du serveur
      room_check: false, //boolean pour switch l'opérateur ternaire
    };
    socket = io(this.state.endpoint);
  }

  play = (url) => {
    let stream = new Audio(url);
    stream.preload = 'none';
    stream.play();
  }

  stop = (url) => {
    let stream = new Audio(url);
    stream.preload = 'none';
    stream.stop(url);
  }

  login(event) {
    event.preventDefault();
    if (this.state.username !== ""){this.setState({session: true})
    socket.emit('user-login', {username: this.state.username})
    this.setState({username: ''});
    }
    this.play(soundCoin);
  }

  createRoom(event){
    event.preventDefault();
    if(this.state.room !== ""){this.setState({room_check: true})
    socket.emit('createRoom',{roomName: this.state.room, user: this.state.username})

    }
     this.setState({room: ''});
     this.play(soundCoinRoom);
  }

  joinRoom(roomName){
    socket.emit('joinRoom', {roomName: roomName, user: this.state.username})
    if (!this.state.room) {this.setState({room_check: true})};
    this.play(soundCoinRoom);
  }

  leaveRoom(roomName){
    socket.emit('leaveRoom', {roomName: roomName, user: this.state.username})
    this.setState({room_check: false})
    this.setState({room:''})
  }

  sendMessage(event) {
    event.preventDefault();
    socket.emit('chat-message', {message: this.state.message})
    this.setState({message: ''});
  }

  componentDidMount(){
  // reception des messages
    socket.on('chat-message', (data) =>{
      this.setState({messages: [...this.state.messages, data]});
      console.log("chat-message");
    });

    socket.on('login',(data) => {
      this.setState({username: data.userName});
      console.log("login");
    });

    socket.on('room-service',(data) => {
      this.setState({room: data[0], playerOne: data[1], playerTwo: data[2]});
      console.log("room-service delivered")
    });

    socket.on('player-number', (data) => {
      this.setState({playerNumberOne: true});
      console.log("player-number");
    });

    socket.on('room-list', (data) => {
      this.setState({rooms: data});
      console.log("state room : ", this.state.rooms);
    })

  }
  render(){
    // console.log(this.state);
    return (

      <>
      { !this.state.room_check ?
        <div>{ this.state.session ?
          <div>
           {  !this.state.room_check ?
            <div>

              <section className="chat">
                  {this.state.rooms.map(item => {
                    return (
                      <div>{item}
                      <button onClick={()=>this.joinRoom(item)}>Join room</button>


                      </div>
                    )}
                  )}
              </section>

              <form>
                <input
                  className="m"
                  autoComplete="off"
                  value={this.state.room}
                  onChange={ev => this.setState({room: ev.target.value})}/>
                <button onClick={this.createRoom}>Create room</button>
              </form>
              <h5>Hello {this.state.username}</h5>
            </div>
            :
            <div>
              <div>
                <h3>{this.state.room}</h3>
                <button onClick={() => this.leaveRoom(this.state.room)}>Leave room</button>
              </div>
              <form action="">
                <input
                  className="m"
                  autoComplete="off"
                  value={this.state.message}
                  onChange={ev => this.setState({message: ev.target.value})}/>
                <button className="myButton" onClick={this.sendMessage}>Send</button>
              </form>
              <section className="chat">
                {this.state.messages.map(msg => {
                  return (
                    <p>{msg.username} {msg.message}</p>
                  )}
                )}
              </section>
            </div>
          }
          </div>
          :
           <section className="login">
            <form action="">
              <label htmlFor="u">Username </label>
              <input
                className="u"
                onChange={ev => this.setState({username: ev.target.value})}
                autoComplete="off"
                autoFocus />
              <button className="myButton" onClick={this.login}>Login</button>
            </form>
          </section>
        }</div>
        :
        <Game
            playerOne={this.state.playerOne}
            playerTwo={this.state.playerTwo}
            playerNumberOne={this.state.playerNumberOne}
            socket={socket}
        />
      }
      </>
    );
  }
}
export default Chat;
