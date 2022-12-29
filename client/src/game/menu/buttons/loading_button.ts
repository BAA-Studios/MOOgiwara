import { Scene } from 'phaser';

import Button from "./button";

/**
 * Play button for main menu.
 * Please pre-load the desired button image as 'tallButton'.
 */
export default class LoadingButton extends Button {
  loadingImage: Phaser.GameObjects.Image;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    buttonImageName = 'tallButton'
  ) {
    super(
      scene,
      x,
      y,
      buttonImageName,
      '      Loading...',
      { fontFamily: 'Impact', fontSize: '48px', color: '#FFF' }, // https://newdocs.phaser.io/docs/3.55.2/Phaser.Types.GameObjects.Text.TextStyle
      () => {}
    );
    console.log(buttonImageName);
    this.disableInteractive(); // This button is purely for show, it should not be clickable
    this.loadingImage = this.scene.add.image(x - 100, y, 'loading');
    this.loadingImage.setScale(0.18);
    this.loadingImage.setOrigin(0.5, 0.5);
    this.scene.tweens.add({
      targets: this.loadingImage,
      angle: 360,
      duration: 1000,
      repeat: -1,
    });
  }

  override destroy() {
    super.destroy();
    this.loadingImage.destroy(); // TODO: Remove this from tween targets
  }
}
