export class Score {
    constructor() {
        this.playerHits = 0;
        this.computerHits = 0;
    }

    incrementPlayerHits() {
        this.playerHits += 1;
    }

    incrementComputerHits() {
        this.computerHits += 1;
    }

    reset() {
        this.playerHits = 0;
        this.computerHits = 0;
    }
}
