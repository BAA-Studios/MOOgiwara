import { Scene } from 'phaser';

import Button from "./button";

/**
 * Play button for main menu.
 * Please pre-load the desired button image as 'tallButton'.
 */
export default class StandardButton extends Button {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    onClickAction: Function
  ) {
    super(
      scene,
      x,
      y,
      'standardButton',
      text,
      { fontFamily: 'Impact', fontSize: '48px', color: '#FFF' }, // https://newdocs.phaser.io/docs/3.55.2/Phaser.Types.GameObjects.Text.TextStyle
      onClickAction
    );
  }
}
