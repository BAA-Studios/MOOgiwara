import Phaser from 'phaser';

export default class UiHandler {
  scene: Phaser.Scene;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  initUi = () => {
    // Create a button to go back to the main menu
    const backButton = this.scene.add.text(0, 0, 'Back');
    backButton.setStyle({ fontSize: '16px', fill: '#000000' });

    backButton.setInteractive();
    backButton.on('pointerdown', () => {
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
  };

  onEndTurn = () => {
    console.log("End this player's turn");
  };
}
