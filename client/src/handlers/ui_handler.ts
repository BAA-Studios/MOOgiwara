import StandardButton from "../game/menu/buttons/standard_button";
import GameBoard from "../scenes/game_board";
import { PlayerState } from "../game/player";

export default class UiHandler {
  scene: GameBoard;
  endTurnButton: StandardButton;
  constructor(scene: GameBoard) {
    this.scene = scene;
    this.endTurnButton = this.scene.add.existing(new StandardButton(this.scene, 250, 1080/2, 'LOADING...', this.onEndTurn));
    this.endTurnButton.buttonText.setFontSize(34);
  }

  initUi = () => {
    // Create a button to go back to the main menu
    const backButton = this.scene.add.text(0, 0, 'Back');
    backButton.setStyle({ fontSize: '16px', fill: '#000000' });

    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      this.scene.client.disconnect();
      this.scene.scene.start('main-menu');
    });

    // Makes the button turn red when hovered over
    backButton.on('pointerover', () => {
      backButton.setStyle({ fill: '#ff0000' });
    });

    // Turn the button back to normal color after the mouse leaves
    backButton.on('pointerout', () => {
      backButton.setStyle({ fill: '#000000' });
    });


    // TODO: Replace this with the player's username once its implemented
    // Add the player's ID to the bottom left of the screen
    const playerText = this.scene.add.text(
      0,
      20,
      'Player ID: ' + this.scene.player.getUniqueId()
    );
    playerText.setStyle({ fontSize: '16px', fill: '#000000' });

  };

  onEndTurn = () => {
    console.log("[INFO] End Turn Button Clicked");
    if (this.scene.player.playerState !== PlayerState.MAIN_PHASE) {
      return;
    }
    this.scene.player.playerState = PlayerState.LOADING;
    this.scene.client.emit("endTurn", { player: this.scene.player.getUniqueId() });
  };
}
