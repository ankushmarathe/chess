class Game {
    user1;
    user2;
    t1 = 180;
    t2 = 180;
    moves;
    board
    startTime;
    constructor(user1, user2) {
        this.user1 = user1;
        this.user2 = user2;
        this.moves = [];
        this.board = "";
        this.gameStatus = 'pending';
        this.startTime = new Date();
        user1.emit('gameStarted', {
            myturn: true,
            orientation: 'white'
        });
        user1.emit('time', { time: 180 })
        user2.emit('gameStarted', {
            myturn: false,
            orientation: 'black'
        });
    }
    rematch(user1, user2) {
        this.user1 = user1;
        this.user2 = user2;
        this.moves = [];
        this.board = "";
        this.gameStatus = 'pending';
        this.startTime = new Date();
        user1.emit('gameStarted', {
            myturn: true,
            orientation: 'white'
        });
        user1.emit('time', { time: 180 })
        user2.emit('gameStarted', {
            myturn: false,
            orientation: 'black'
        });
    }
    move(socket, move, time) {
        if (this.user1 == socket) {
            this.t1 = time;
            this.user2.emit('moveReceived', { move: move, myTime: this.t2, oTime: this.t1 });
        } else if (this.user2 == socket) {
            this.t2 = time;
            this.user1.emit('moveReceived', { move: move, myTime: this.t1, oTime: this.t2 });
        }
    }

}
class GameManager {
    gameArray = [];
    users = [];
    pendingUser;

    constructor() {
    }

    addUser(socket) {
        this.users.push(socket);
        this.socketHandler(socket);
    }

    removeUser(socket) {
        this.users.splice(this.users.indexOf(socket), 1);
        let game = this.gameArray.find(game => game.user1 === socket || game.user2 === socket);
        if (game) {
            game.user1.emit('gameOver', 'user left');
            game.user2.emit('gameOver', 'user left');
        }
    }

    socketHandler(socket) {
        socket.on('message', (message) => {
            if (message == 'init') {
                if (this.pendingUser) {
                    const game = new Game(this.pendingUser, socket);
                    this.gameArray.push(game);
                    this.pendingUser = null;
                    // this.pendingUser.emit('moveReceived', {
                    //     from: 'c2',
                    //     to: 'c3'
                    //  })
                    // socket.emit('moveReceived', {
                    //     from: 'c7',
                    //     to: 'c6'
                    //  })

                } else {
                    this.pendingUser = socket;
                }
            }

            if (message.type === 'move') {
                let game = this.gameArray.find(game => game.user1 === socket || game.user2 === socket);
                game.move(socket, message.data, message.time)
            }

            if (message.type === 'timeout') {
                let game = this.gameArray.find(game => game.user1 === socket || game.user2 === socket);
                game.user1.emit('gameOver', 'timeout');
                game.user2.emit('gameOver', 'timeout');
            }

            if (message === 'rematch') {
                let game = this.gameArray.find(game => game.user1 === socket || game.user2 === socket);
                if (game.user1 === socket) {
                    game.user2.emit('rematch');
                } else {
                    game.user1.emit('rematch');
                }
            }

            if (message === 'rematch:accepted') {
                let game = this.gameArray.find(game => game.user1 === socket || game.user2 === socket);
                if (game.user1 === socket) {
                    game.rematch(game.user1, game.user2);
                } else {
                    game.rematch(game.user2, game.user1);
                }
            }
        });
    }
}

module.exports = GameManager;