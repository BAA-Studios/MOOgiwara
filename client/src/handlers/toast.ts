// Given a scene, pop up a notification
export function notification(scene: Phaser.Scene, description: string, color: number = 0x00ff00){
    let popup = scene.add.graphics();
    popup.fillStyle(color, 0.6);
    // Make center of screen with origin 0, 0
    popup.fillRoundedRect(0, 0, 600, 70, 18);
    popup.setPosition(685, -200);

    let desc = scene.add.text(985, -200, description);
    desc.setStyle({
        fontSize: '26px',
        fontFamily: 'Merriweather',
        color: '#000000',
      });
    desc.setOrigin(0.5);

    // let icon = scene.add.image(800, 540, iconPath);
    let closeButton = scene.add.text(1220, -200, "X");
    closeButton.setStyle({
        fontSize: '55px',
        fontFamily: 'Merriweather',
        color: '#ffffff',
      });
    closeButton.setOrigin(0, 0);

    // Make them stay, and then yoyo back to original position
    scene.tweens.add({
        targets: popup,
        y: 0,
        ease: 'Power1',
        duration: 600,
        onComplete: () => {
            scene.tweens.add({
                targets: popup,
                y: -200,
                ease: 'Power1',
                duration: 700,
                delay: 1000,
            });
        }
    });

    scene.tweens.add({
        targets: desc,
        y: 35,
        ease: 'Power1',
        duration: 600,
        repeat: 0,
        onComplete: () => {
            scene.tweens.add({
                targets: desc,
                y: -200,
                ease: 'Power1',
                duration: 700,
                delay: 1000,
            });
        }
    });
}

