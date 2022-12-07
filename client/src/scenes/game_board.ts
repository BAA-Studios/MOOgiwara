import Phaser from 'phaser';

export default class GameBoard extends Phaser.Scene {
  constructor() {
    super('game-board');
  }

  preload() {
    this.load.image('background', './images/moogiwara_game_board.png');
  }

  create() {
    this.add.image(0, 0, 'background').setOrigin(0, 0);

    // Create a button to go back to the main menu
    const backButton = this.add.text(0, 0, 'Back');
    backButton.setStyle({ fontSize: '16px', fill: '#000000' });

    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      this.scene.start('main-menu');
    });

    // Makes the button turn red when hovered over
    backButton.on('pointerover', () => {
      backButton.setStyle({ fill: '#ff0000' });
    });

    // Turn the button back to normal color after the mouse leaves
    backButton.on('pointerout', () => {
      backButton.setStyle({ fill: '#000000' });
    });

    // Create a button to go back to end turn in the middle of the screen
    // TODO: Add an actual button image
    const endTurn = this.add.text(1000, 360, 'End Turn');
    endTurn.setStyle({ fontSize: '16px', fill: '#000000' });

    endTurn.setInteractive();
    endTurn.on('pointerdown', this.onEndTurn);

    // Makes the button turn red when hovered over
    endTurn.on('pointerover', () => {
      endTurn.setStyle({ fill: '#ff0000' });
    });

    // Turn the button back to normal color after the mouse leaves
    endTurn.on('pointerout', () => {
      endTurn.setStyle({ fill: '#000000' });
    });
  }

  // update(time: number, delta: number): void {

  // }

  // Called when the player clicks end turn button
  onEndTurn = () => {
    console.log("End this player's turn");
  };
}
