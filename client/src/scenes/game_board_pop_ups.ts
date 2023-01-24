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
import Card from '../game/card';
import { PlayerState } from '../game/player';

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
export function displayCardInHigherRes(scene: Phaser.Scene, card: Card) {
  const rect = inflateTransparentBackground(scene);
  // Animation for when the card pops up in the screen similar to hearthstone
  const cardImg = scene.add
    .image(960, 540, card.cardId)
    .setScale(0.01)
    .setInteractive();
  scene.add.tween({
      targets: cardImg,
      scaleX: 0.75,
      scaleY: 0.75,
      duration: 250,
      ease: 'Power1',
  });
  // Create another box to the right of the card to display the amount of Don!! Attached
  const donAttachedBox = scene.add.rectangle(1190, 224, 200, 150, 0x000000, 0.6).setOrigin(0, 0).setScale(0.01);
  // Create a text object to display the amount of Don!! Attached
  const donAttachedText = scene.add
    .text(1400, 540, '0')
    .setOrigin(0.5, 0.5)
    .setFontFamily("Merriweather")
    .setFontSize(45)
    .setScale(0.01);
  donAttachedText.setText(`Don!!\n+${card.calculateBonusAttackFromDon()}`);
  // Animation for when the box pops up in the screen similar to hearthstone
  scene.add.tween({
      targets: [donAttachedBox, donAttachedText],
      scaleX: 1,
      scaleY: 1,
      duration: 250,
      ease: 'Power1',
  });

  let donRendered: Phaser.GameObjects.Image[] = [];
  // Render the Don!! card under the donAttachedBox

  for (let i = 0; i < card.donAttached.size(); i++) {
    let don = scene.add.image(1190 + (i * 60), 380, 'donCardAltArt').setScale(0.01).setOrigin(0, 0);
    donRendered.push(don);
    scene.add.tween({
      targets: don,
      scaleX: 0.16,
      scaleY: 0.16,
      duration: 250,
      ease: 'Power1',
  });
  }

  // Set the text in the middle of the donAttachedBox
  donAttachedText.x = donAttachedBox.x + donAttachedBox.width / 2;
  donAttachedText.y = donAttachedBox.y + donAttachedBox.height / 2;
  rect.on('pointerdown', () => {
    cardImg.destroy();
    rect.destroy();
    donAttachedBox.destroy();
    donAttachedText.destroy();
    for (let i = 0; i < donRendered.length; i++) {
      donRendered[i].destroy();
    }
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

  scene.time.addEvent({
    delay: 1000,
    callback: () => {
      scene.player.playerState = PlayerState.MULLIGAN;
    },
  });

  let loadingButton: LoadingButton | undefined = undefined;

  // Add a button that will emit a mulligan event to the server
  const mulliganButton = scene.add.existing(
    new StandardButton(scene, 960, 800, "MULLIGAN", () => {
      if (scene.player.playerState !== PlayerState.MULLIGAN) {
        return;
      }
      loadingButton = scene.add.existing(
        new LoadingButton(scene, 960, 800, "standardButton")
      );
      keepButton.disableInteractive();
      mulliganButton.disableInteractive();
      
      scene.player.shuffleHandToDeck();
      scene.player.requestDrawCard(scene, 5, () => {
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
      if (scene.player.playerState !== PlayerState.MULLIGAN) {
        return;
      }
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

    // Rendering the initial life cards for both sides
    if (scene.player.leader) {
      for (let i = 0; i < scene.player.leader.life; i++) { 
        let blankCard = new Card(scene.player, scene, 'optcg_card_back')
          .setOrigin(0, 0)
          .setScale(0.16);
        // Rotate the card horizontally to the right
        blankCard.flipX = true;
        blankCard.flipY = true;
        blankCard.setRotation(Math.PI / 2);
        blankCard.setPosition(128, i * 35);
        scene.gameHandler.playerLifeArea.add(blankCard);
      }
    }

    if (scene.opponent.leader) {
      for (let i = 0; i < scene.opponent.leader.life; i++) {
        let blankCard = new Card(scene.opponent, scene, 'optcg_card_back')
          .setOrigin(0, 0)
          .setScale(0.16);
        blankCard.flipX = true;
        blankCard.flipY = true;
        blankCard.setRotation(Math.PI / 2);
        blankCard.setPosition(128, i * 35);
        scene.gameHandler.opponentLifeArea.add(blankCard);
      }
    }
  });
}
