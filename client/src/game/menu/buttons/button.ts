import Phaser, { Scene } from 'phaser';

import { defaultActiveTintColor, defaultHoverTintColor } from './default_tints';

/**
 * Generic button class for other buttons to extend
 * Do note that images like the button image need to be pre-loaded in the scene first.
 *
 * @class Button
 * @extends {Phaser.GameObjects.Container}
 */
export default class Button extends Phaser.GameObjects.Container {
  buttonImage: Phaser.GameObjects.Image;
  buttonText: Phaser.GameObjects.Text;
  activeTintColor: number;
  hoverTintColor: number;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    buttonImageName: string,
    text: string,
    textStyle: any,
    onClickAction: Function,
    activeTintColor = defaultActiveTintColor,
    hoverTintColor = defaultHoverTintColor
  ) {
    super(scene, x, y);
    this.buttonImage = scene.add.image(x, y, buttonImageName);
    this.buttonText = scene.add.text(0, 0, text, textStyle).setOrigin(0.5);
    this.activeTintColor = activeTintColor;
    this.hoverTintColor = hoverTintColor;
    Phaser.Display.Align.In.Center(this.buttonText, this.buttonImage);
    this.setSize(this.buttonImage.width, this.buttonImage.height);

    this.setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () =>
        this.enterButtonHoverState()
      )
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () =>
        this.enterButtonRestState()
      )
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () =>
        this.enterButtonActiveState()
      )
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        this.enterButtonHoverState();
        onClickAction();
      });
  }

  enterButtonHoverState() {
    this.buttonImage.setTint(this.hoverTintColor);
  }

  enterButtonRestState() {
    this.buttonImage.clearTint();
    this.buttonText.clearTint();
  }

  enterButtonActiveState() {
    this.buttonImage.setTint(this.activeTintColor); // slight grey tint, whilst button is held down
  }

  override destroy() {
    super.destroy();
    this.buttonImage.destroy();
    this.buttonText.destroy();
  }
}
