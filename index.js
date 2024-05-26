const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
// const { Game } = require('src\game.ts');
const Game = require('./gameManager'); 
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));
app.use(express.json());

let gameManager = new GameManager();
io.on('connection', (socket)=>{
    socket.on('join', ()=>{
        gameManager.addUser(socket);
        socket.emit('join-success', {message: 'Connected to server'});
    });
    socket.on('disconnect', () => {
        gameManager.removeUser(socket);
    });
})

const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});