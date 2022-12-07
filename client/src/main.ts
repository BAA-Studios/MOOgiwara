import Phaser from 'phaser'

import MainMenu from './scenes/main_menu'

const config = {
	type: Phaser.AUTO,
	width: 1280,
	height: 720,
	scene: [MainMenu]
}

export default new Phaser.Game(config)
