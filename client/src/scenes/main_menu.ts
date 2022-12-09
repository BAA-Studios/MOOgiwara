import Phaser from 'phaser';

import Button from '../game/menu/buttons/button';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('main-menu');
  }

  // TODO: https://blog.ourcade.co/posts/2020/phaser-3-google-fonts-webfontloader/
  preload() {
    this.load.image('tallButton', './buttons/Tall Button.png');
  }

  create() {
    this.add.existing(new Button(
      this,
      640,
      360,
      'tallButton',
      'PLAY!',
      { fontFamily: 'Impact', fontSize: '48px', color: '#FFF'},  // https://newdocs.phaser.io/docs/3.55.2/Phaser.Types.GameObjects.Text.TextStyle
      () => {
        console.log('Play button clicked!');
      }
    ));
  }

  // update(time: number, delta: number): void {

  // }
}
