/**
 * This file contains all the pop ups that are displayed in the game board
 * 
 * This includes:
 * - Displaying a card in higher resolution
 * - Displaying a mulligan selection
 * - Scryin effects
 * - Displaying Trash Pile
 */

import GameBoard from './game_board';
import StandardButton from '../game/menu/buttons/standard_button';
import LoadingButton from '../game/menu/buttons/loading_button';

// Used in game mechanics that require scrying the deck, or displaying something
export function inflateTransparentBackground(scene: Phaser.Scene) {
  // Creates an interactive rectangle that covers the entire screen
  return scene.add
    .rectangle(0, 0, 1920, 1080, 0x000000, 0.5)
    .setOrigin(0, 0)
    .setInteractive()
    .setName('transparentBackground');
}

// For when users right click a card in play
// Show the image of the card in a higher resolution
export function displayCardInHigherRes(scene: Phaser.Scene, cardId: string) {
  const rect = inflateTransparentBackground(scene);
  // Animation for when the card pops up in the screen similar to hearthstone
  const cardImg = scene.add
    .image(960, 540, cardId)
    .setScale(0.01)
    .setInteractive();
  scene.add.tween({
      targets: cardImg,
      scaleX: 0.75,
      scaleY: 0.75,
      duration: 250,
      ease: 'Power1',
    });
  rect.on('pointerdown', () => {
    cardImg.destroy();
    rect.destroy();
  });
}

// This will display a screen that asks the user if they want to mulligan given their hand
export function displayMulliganSelection(scene: GameBoard) {
  const hand = scene.player.hand;
  const rect = inflateTransparentBackground(scene);
  const mulliganText = scene.add
    .text(960, 200, "Choose Whether to Mulligan")
    .setOrigin(0.5, 0.5)
    .setFontSize(50)
    .setInteractive();
  const cardImgs: Phaser.GameObjects.Image[] = [];

  for (let i = 0; i < hand.length; i++) {
    const card = hand.getElementByPos(i);
    cardImgs.push(
      scene.add.image(260 + i * 350, 500, card.cardId).setScale(0.01)
    );
    scene.add.tween({
      targets: cardImgs[i],
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 250,
      ease: 'Power1',
    });
  }

  let loadingButton: LoadingButton | undefined = undefined;

  // Add a button that will emit a mulligan event to the server
  const mulliganButton = scene.add.existing(
    new StandardButton(scene, 960, 800, "MULLIGAN", () => {
      loadingButton = scene.add.existing(
        new LoadingButton(scene, 960, 800, "standardButton")
      );
      keepButton.disableInteractive();
      mulliganButton.disableInteractive();
      
      scene.player.shuffleHandToDeck();
      scene.player.drawCard(5);
      scene.time.delayedCall(250, () => {
        // Destroy old cards displayed to push new hand
        for (const cardImg of cardImgs) {
          cardImg.destroy();
        }
        cardImgs.splice(0); // Clear the array
        for (let i = 0; i < hand.size(); i++) {
          const card = hand.getElementByPos(i);
          cardImgs.push(
            scene.add.image(260 + i * 350, 500, card.cardId).setScale(0.01)
          );
          scene.add.tween({
            targets: cardImgs[i],
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 250,
            ease: 'Power1',
          });
        }
        scene.player.client.emit("onMulligan", {
          lobbyId: scene.lobbyId,
          mulligan: "mulligan",
        });
      });
    })
  );

  const keepButton = scene.add.existing(
    new StandardButton(scene, 960, 875, "KEEP", () => {
      scene.client.emit("onMulligan", {
        lobbyId: scene.lobbyId,
        mulligan: "keep",
      });
      keepButton.disableInteractive();
      mulliganButton.disableInteractive();
      loadingButton = scene.add.existing(
        new LoadingButton(scene, 960, 875, "standardButton")
      );
    })
  );
  scene.client.on('mulliganDone', () => {
    rect.destroy();
    mulliganText.destroy();
    mulliganButton.destroy();
    for (const cardImg of cardImgs) {
      cardImg.destroy();
    }
    loadingButton?.destroy();
    keepButton.destroy();
  });
}
