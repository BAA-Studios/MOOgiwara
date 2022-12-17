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
    this.scene.client.on('chatMessage', (data: any) => {
      console.log(data.message);
      this.messages.push(data.message);
      this.chat.setText(this.messages.join('\n'));
    });
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
  };

  onEnterMessage = () => {
    const chatbox = this.textInput.getChildByName("chat");
    if (chatbox === null) {
      return;
    }
    if (chatbox.value === "") {
      return;
    }
    let message = chatbox.value;
    let copyMessage = message;
    chatbox.value = '';

    const maxLength: number = 34;
    const lines: string[] = [];

    while (message.length >= maxLength) {
      lines.push(message.substring(0, maxLength));
      message = message.substring(maxLength);
    }

    if (maxLength * lines.length < copyMessage.length) {
      lines.push(copyMessage.substring(maxLength * lines.length));
      message = lines.join('\n');
    }

    this.scene.client.emit('chatMessage', {
      message: this.scene.player.username + ': ' + message,
      lobbyId: this.scene.lobbyId,
    });
  };
}
