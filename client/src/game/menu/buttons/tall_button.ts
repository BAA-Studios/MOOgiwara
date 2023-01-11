import { Scene } from 'phaser';

import Button from "./button";

/**
 * Play button for main menu.
 * Please pre-load the desired button image as 'tallButton'.
 */
export default class TallButton extends Button {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    onClickAction: Function,
    text: string
  ) {
    super(
      scene,
      x,
      y,
      'tallButton',
      text,
      { fontFamily: 'Impact', fontSize: '48px', color: '#FFF' }, // https://newdocs.phaser.io/docs/3.55.2/Phaser.Types.GameObjects.Text.TextStyle
      onClickAction
    );
  }
}
