import { Scene } from 'phaser';

import Button from "./button";
import {
  defaultHollowActiveTintColor,
  defaultHollowHoverTintColor,
} from './default_tints';

/**
 * Wrapper class for hollow buttons, which have a different tint
 *
 * @class HollowButton
 * @extends {Button}
 */
export default class HollowButton extends Button {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    buttonImageName: string,
    text: string,
    textStyle: any,
    onClickAction: Function,
    activeTintColor = defaultHollowActiveTintColor,
    hoverTintColor = defaultHollowHoverTintColor
  ) {
    super(
      scene,
      x,
      y,
      buttonImageName,
      text,
      textStyle,
      onClickAction,
      activeTintColor,
      hoverTintColor
    );
  }

  enterButtonHoverState() {
    this.buttonImage.setTint(this.hoverTintColor);
    this.buttonText.setTint(this.hoverTintColor);
  }
}
