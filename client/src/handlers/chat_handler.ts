import Phaser from "phaser";
import GameBoard from "../scenes/game_board";

export default class ChatHandler {
  scene: GameBoard;
  messages: string[];
  textInput: Phaser.GameObjects.DOMElement;
  chat: Phaser.GameObjects.Text;

  constructor(scene: GameBoard) {
    this.scene = scene;
    this.messages = [];
    this.textInput = this.scene.add
      .dom(1690, 922)
      .createFromCache('chatbox');
    this.chat = this.scene.add.text(1441, 110, '', {
      lineSpacing: 15,
      backgroundColor: '#FFFFFF',
      color: '#000000',
      padding: 10,
      fontStyle: 'bold',
    });
    this.chat.setFixedSize(400, 750);
  }

  initChat = () => {
    this.enterKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );

    this.enterKey.on('down', (event) => {
      this.onEnterMessage();
    });

    // If they click outside of the input box, then we want to unfocus the input box
    this.scene.input.on('pointerdown', (event) => {
      if (event.target !== 'chat') {
        let el = (<HTMLInputElement>document.getElementById('chat'));
        el.blur();
      }
    });

    this.scene.client.on('chatMessage', (data: any) => {
      this.messages.push(data.message);
      this.chat.setText(this.messages.join('\n'));
    });
  };

  onEnterMessage = () => {
    const chatbox = this.textInput.getChildByName("chat");
    if (chatbox === null) {
      return;
    }
    if (chatbox.value === "") {
      return;
    }
    const message = chatbox.value;
    chatbox.value = '';

    this.scene.client.emit('chatMessage', {
      message: this.scene.player.username + ': ' + message,
      lobbyId: this.scene.lobbyId,
    });
  };
}
