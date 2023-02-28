import Card from "./card";
import { Vector } from "js-sdsl";
import StandardButton from "./menu/buttons/standard_button";
import GameBoard from "../scenes/game_board";
import { inflateTransparentBackground } from "../scenes/game_board_pop_ups";

export default class CounterStack {
    scene: GameBoard;
    title: Phaser.GameObjects.Text;
    resolveButton: StandardButton
    hideButton: StandardButton
    counterStackGraphic: Phaser.GameObjects.Graphics;
    grayBackground: Phaser.GameObjects.Rectangle;
    counters: Vector<Card> = new Vector<Card>();
    isHiding: boolean = false;

    constructor(scene: GameBoard) {
        this.scene = scene;
        this.grayBackground = inflateTransparentBackground(scene);
        this.grayBackground.setVisible(false);
        this.title = scene.add.text(1920/2, 125, 
        "Click Any Counter Cards",
        {
            fontFamily: 'Merriweather',
            fontSize: "84px",
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.8)',
        }).setOrigin(0.5, 0.5);
        this.title.setVisible(false);

        this.counterStackGraphic = scene.add.graphics();
        this.counterStackGraphic.fillStyle(0x000000, 0.6);
        this.counterStackGraphic.fillRoundedRect(620, 470, 800, 180, 18);
        this.counterStackGraphic.setVisible(false);

        this.resolveButton = scene.add.existing(new StandardButton(scene, 1600, 520, 'RESOLVE', () => {
            this.resolve();
        }));
        this.resolveButton.setInteractive(false);
        this.resolveButton.setVisible(false);

        this.hideButton = scene.add.existing(new StandardButton(scene, 1600, 600, 'HIDE', () => {
            if (this.isHiding) {
                this.show();
                return;
            }
            this.hide();
        }));
        this.hideButton.setInteractive(false);
        this.hideButton.setVisible(false);
    }

    // Displays the counter stack for the player
    inflate() {
        this.grayBackground.setVisible(true);

        this.title.setVisible(true);

        this.counterStackGraphic.setVisible(true);

        this.resolveButton.setVisible(true);
        this.resolveButton.setInteractive(true);

        this.hideButton.setInteractive(true);
        this.hideButton.setVisible(true);
    }

    push(card: Card) {
        this.counters.pushBack(card);
    }

    calculateTotalCounter() {

    }

    // Resolves any counters within the stack
    resolve() {

    }

    // Hides the counter stack
    hide() {
        this.title.setVisible(false);
        this.counterStackGraphic.setVisible(false);
        this.resolveButton.setVisible(false);
        this.resolveButton.setInteractive(false);
        this.hideButton.buttonText.setText('SHOW');

        this.grayBackground.setVisible(false);
        this.isHiding = true;
    }

    show() {
        this.title.setVisible(true);
        this.counterStackGraphic.setVisible(true);
        this.resolveButton.setVisible(true);
        this.resolveButton.setInteractive(true);
        this.hideButton.buttonText.setText('HIDE');
        this.grayBackground.setVisible(true);
        this.isHiding = false;
    }

    destroy() {
        this.title.destroy();
        this.counterStackGraphic.destroy();
        this.resolveButton.destroy();
        this.hideButton.destroy();
        this.grayBackground.destroy();
    }
}