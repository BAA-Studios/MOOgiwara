import Phaser from 'phaser'

import MainMenu from './scenes/main_menu'

const game = {
	type: Phaser.AUTO,
	width: 1280, // TODO: Figure out how big this game should be
	height: 720,
	parent: 'moogiwara',
	scene: [MainMenu]
}

export default new Phaser.Game(game)
