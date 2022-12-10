import { Scene } from 'phaser';

import Button from "./button";

/**
 * Play button for main menu.
 * Please pre-load the desired button image as 'tallButton'.
 */
export default class LoadingButton extends Button {
  constructor(scene: Scene, x: number, y: number) {
    super(
      scene,
      x,
      y,
      'tallButton',
      '      Loading...',
      { fontFamily: 'Impact', fontSize: '48px', color: '#FFF' }, // https://newdocs.phaser.io/docs/3.55.2/Phaser.Types.GameObjects.Text.TextStyle
      () => {}
    );
    this.disableInteractive(); // This button is purely for show, it should not be clickable
    const loadingImage = this.scene.add.image(260, 901, 'loading');
    loadingImage.setScale(0.18);
    loadingImage.setOrigin(0.5, 0.5);
    this.scene.tweens.add({
      targets: loadingImage,
      angle: 360,
      duration: 1000,
      repeat: -1,
    });
  }
}
