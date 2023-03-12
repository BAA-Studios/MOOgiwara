import { inflateTransparentBackground } from "../scenes/game_board_pop_ups";
// import // This is my x button

export function notification(scene: Phaser.Scene, titletext: string, desctext: string, color: number, iconpath: string){
    let cover = inflateTransparentBackground(scene);
    cover.setInteractive(false);

    let popup = scene.add.graphics();
    popup.fillStyle(color, .3);
    popup.fillRoundedRect(960, 540, 400, 105, 18);

    let title = scene.add.text(850, 540, titletext);
    title.setStyle({
        fontSize: '55px',
        fontFamily: 'Merriweather',
        color: '#000000',
      });
    title.setOrigin(0, 0);

    let desc = scene.add.text(850, 560, desctext);
    desc.setStyle({
        fontSize: '30px',
        fontFamily: 'Merriweather',
        color: '#000000',
      });
    desc.setOrigin(0, 0);

    let icon = scene.add.image(800, 540, iconpath);
    // let closeButton = scene.add.image(1120, 540, // xpath);
    

}

