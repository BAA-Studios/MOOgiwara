import Phaser from 'phaser';

import PlayButton from '../game/menu/buttons/play_button';
import HollowShortButton from '../game/menu/buttons/hollow_short_button';
import LoadingButton from '../game/menu/buttons/loading_button';
import { connectToServer, waitForGame } from '../network/connection';

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super('main-menu');
  }

  // TODO: https://blog.ourcade.co/posts/2020/phaser-3-google-fonts-webfontloader/
  preload() {
    this.load.image('tallButton', './buttons/Tall Button.png');
    this.load.image('hollowShortButton', './buttons/Hollow Short Button.png')
    this.load.image('loading', './images/mugiwara_logo_temp.png')
  }

  // TODO: Groupings + dynamic relative coordinate resolution
  create() {
    // Logo ----------------------------------------------------------
    this.add.text(
      10,
      80,
      'PLACEHOLDER FOR LOGO',
      { fontFamily: 'Georgia Bold', fontSize: '44px', color: '#222' }
    );

    this.add.text(
      12,
      132,
      'ONE PIECE TCG Online Simulator (ALPHA)',
      { fontFamily: 'Georgia Bold', fontSize: '24px', color: '#222' }
    );

    // Description ---------------------------------------------------
    this.add.text(
      212,
      380,
      'HOW TO PLAY',
      { fontFamily: 'Georgia', fontSize: '28px', color: '#222' }
    );

    this.add.text(
      214,
      420,
      "Hit the 'Play!' button to start playing with friends!\nUse the 'Create Deck' button to make new decks, if you have an account with us.",
      { fontFamily: 'Georgia', fontSize: '18px', color: '#222' }
    );

    // Buttons -------------------------------------------------------
    const playButton = new PlayButton(
      this,
      360,
      900,
      () => {
        console.log('Play button clicked!');
        // TODO: Add Lobby ID option

        // Make the play button show a Loading animation
        // TODO: While loading, the other buttoons should be disabled (Create Deck, Options)
        playButton.disableInteractive();
        // Create a loading button over the original play button to show the loading animation
        connectToServer(this);
        this.add.existing(
          new LoadingButton(
            this,
            360,
            900
          )
        );
      });

    this.add.existing(playButton);
    
    this.add.existing(new HollowShortButton(
      this,
      662,
      875,
      'Create Deck',
      { fontFamily: 'Impact', fontSize: '20px', color: '#15C' },
      () => {
        console.log('Create Deck button clicked!');
      }
    ));

    this.add.existing(new HollowShortButton(
      this,
      662,
      925,
      'Options',
      { fontFamily: 'Impact', fontSize: '20px', color: '#15C' },
      () => {
        console.log('Options button clicked!');
      }
    ));

    // News ----------------------------------------------------------
    this.add.rectangle(
      1400,
      515,
      620,
      875,
      0xF0F0F0
    );

    this.add.rectangle(
      1400,
      550,
      590,
      780,
      0xF8F8F8
    );

    this.add.text(
      1110,
      110,
      "What's new?",
      { fontFamily: 'Georgia', fontSize: '32px', color: '#222' }
    );

    this.add.text(
      1120,
      180,
      "This is a test page!\nStay tuned for updates!",
      { fontFamily: 'Georgia', fontSize: '18px', color: '#222' }
    );
  }

  // update(time: number, delta: number): void {

  // }
}
