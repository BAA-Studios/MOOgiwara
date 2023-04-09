import Card from "../game/card";
import { displayHoveredCard } from "../scenes/game_board_pop_ups";

export default class CardHoverEvent {
    timerThread: Phaser.Time.TimerEvent = null;
    graphics: Phaser.GameObjects.Image[] = []; // An array of Phaser GameObjects stores all the graphics in the hover event
    card: Card;
    completed: boolean = false;
    readonly delay = 500; // The amount of time the player needs to hover over a card before the hover event is triggered

    constructor(card: Card) {
        this.card = card;
    }

    startHoverEvent() {
        this.timerThread = this.card.scene.time.addEvent({
            delay: this.delay,
            callback: () => {
                this.graphics = displayHoveredCard(this.card.scene, this.card);
                this.completed = true;
            },
            callbackScope: this,
            loop: false
        });
    }

    cleanUp() {
        if (!this.completed) {
            this.timerThread.remove();
        }
        this.timerThread.destroy();
        this.graphics.forEach(graphic => {
            graphic.destroy();
        });
        this.graphics = [];
        this.completed = false;
    }
}