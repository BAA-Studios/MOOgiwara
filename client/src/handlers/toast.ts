import { inflateTransparentBackground } from "../scenes/game_board_pop_ups";
// import // This is my x button

// Given a scene, pop up a notification
export function notification(scene: Phaser.Scene, titleText: string, description: string, color: number = 0x000000, iconPath: string = ""){
    // TODO: Implement the ability to add icons to the notification
    let cover = inflateTransparentBackground(scene);
    cover.setInteractive();
    
    let popup = scene.add.graphics();
    popup.fillStyle(color, 0.6);
    // Make center of screen with origin 0, 0
    popup.fillRoundedRect(0, 0, 600, 95, 18);
    popup.setPosition(685, 480);
    popup.setScale(0.01);

    let title = scene.add.text(705, 485, titleText);
    title.setStyle({
        fontSize: '50px',
        fontFamily: 'Merriweather',
        color: '#000000',
      });
    title.setOrigin(0, 0);
    title.setScale(0.01);

    let desc = scene.add.text(705, 542, description);
    desc.setStyle({
        fontSize: '24px',
        fontFamily: 'Merriweather',
        color: '#000000',
      });
    desc.setOrigin(0, 0);
    desc.setScale(0.01);

    // let icon = scene.add.image(800, 540, iconPath);
    let closeButton = scene.add.text(1220, 500, "X");
    closeButton.setStyle({
        fontSize: '55px',
        fontFamily: 'Merriweather',
        color: '#ffffff',
      });
    closeButton.setOrigin(0, 0);
    closeButton.setScale(0.01);

    scene.tweens.add({
        targets: [popup, title, desc, closeButton],
        scaleX: 1,
        scaleY: 1,
        ease: 'Power1',
        duration: 500,
    });
    
    closeButton.setInteractive();

    closeButton.on('pointerover', () => {
        closeButton.setColor('#ff0000');
    });

    closeButton.on('pointerout', () => {
        closeButton.setColor('#ffffff');
    });

    closeButton.on('pointerdown', () => {
        cover.destroy();
        popup.destroy();
        title.destroy();
        desc.destroy();
        // icon.destroy();
        closeButton.destroy();
    });

}

