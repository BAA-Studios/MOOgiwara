import GameBoard from "../scenes/game_board";

export default class UiHandler {
  scene: GameBoard;
  constructor(scene: GameBoard) {
    this.scene = scene;
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

    // TODO: Create a button to go back to end turn in the middle of the screen

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
    console.log("End this player's turn");
  };
}
