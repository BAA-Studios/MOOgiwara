class Game {
    constructor(lobbyId) {
        this.lobbyId = lobbyId;
        this.playerOneClient = null;
        this.playerTwoClient = null;
    }
    
    isFull() {
        return this.playerOneClient && this.playerTwoClient;
    }

    push(client) {
        if (!this.playerOneClient) {
            this.playerOneClient = client;
        } else if (!this.playerTwoClient) {
            this.playerTwoClient = client;
        }
    }
}

module.exports = Game;