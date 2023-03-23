import Phaser from 'phaser';
import DeckManager from './scenes/deck_manager';
import GameBoard from './scenes/game_board';

import MainMenu from './scenes/main_menu';

const game = {
  type: Phaser.AUTO,
  width: 1920, // TODO: Figure out how big this game should be
  height: 1080,
  parent: 'game-container',
  dom: {
    createContainer: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  transparent: true,
  scene: [MainMenu, GameBoard, DeckManager],
};

const scene = new Phaser.Game(game);
scene.scene.start('main-menu');
