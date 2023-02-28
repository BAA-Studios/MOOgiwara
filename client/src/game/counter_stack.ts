import Card from "./card";
import { Vector } from "js-sdsl";
import StandardButton from "./menu/buttons/standard_button";
import GameBoard from "../scenes/game_board";

export default class CounterStack {
    scene: GameBoard;
    resolveButton: StandardButton
    counterStackGraphic: Phaser.GameObjects.Graphics;
    counterStackHitBox: Phaser.GameObjects.Rectangle;
    counters: Vector<Card> = new Vector<Card>();

    constructor(scene: GameBoard) {
        this.scene = scene;
        this.counterStackGraphic = scene.add.graphics();
        this.counterStackGraphic.setVisible(false);

        this.counterStackHitBox = scene.add.rectangle(250, 1080/2, 500, 1080, 0x000000, 0.0);
        this.counterStackHitBox.setVisible(false);

        this.resolveButton = new StandardButton(scene, 250, 1080/2, 'LOADING...', this.resolve);
        this.resolveButton.setInteractive(false);
        this.resolveButton.setVisible(false);
    }

    // Displays the counter stack for the player
    inflate() {
        this.counterStackGraphic.setVisible(true);
        this.counterStackHitBox.setVisible(true);
        this.resolveButton.setVisible(true);
        this.resolveButton.setInteractive(true);
    }

    push(card: Card) {
        this.counters.pushBack(card);
    }

    calculateTotalCounter() {

    }

    // Resolves any counters within the stack
    resolve() {

    }
}