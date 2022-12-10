import { Scene } from 'phaser';

import HollowButton from './hollow_button';

/**
 * Other buttons button for main menu.
 * Please pre-load the desired button image as 'hollowShortButton'.
 */
export default class HollowShortButton extends HollowButton {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    text: string,
    textStyle: any,
    onClickAction: Function
  ) {
    super(scene, x, y, 'hollowShortButton', text, textStyle, onClickAction);
  }
}
