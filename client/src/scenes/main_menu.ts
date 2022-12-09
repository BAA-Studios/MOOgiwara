import Phaser from 'phaser';

import PlayButton from '../game/menu/buttons/play_button';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('main-menu');
  }

  // TODO: https://blog.ourcade.co/posts/2020/phaser-3-google-fonts-webfontloader/
  preload() {
    this.load.image('tallButton', './buttons/Tall Button.png');
  }

  create() {
    this.add.existing(new PlayButton(
      this,
      360,
      900,
      () => {
        console.log('Play button clicked!');
      }
    ));
  }

  // update(time: number, delta: number): void {

  // }
}
