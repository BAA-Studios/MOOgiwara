import Phaser from 'phaser';
import GameBoard from './scenes/game_board';

import MainMenu from './scenes/main_menu';

const game = {
  type: Phaser.AUTO,
  width: 1280, // TODO: Figure out how big this game should be
  height: 720,
  parent: 'game-container',
  scene: [MainMenu, GameBoard],
};

const scene = new Phaser.Game(game);
scene.scene.start('game-board');
