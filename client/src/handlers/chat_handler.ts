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
      .dom(1196, 690)
      .createFromCache('chatbox')
      .setOrigin(0.5);
    this.chat = this.scene.add.text(1000, 10, '', {
      lineSpacing: 15,
      backgroundColor: '#D3D3D3',
      color: '#000000',
      padding: 10,
      fontStyle: 'bold',
    });
    this.chat.setFixedSize(270, 645);
  }

  initChat = () => {
    this.enterKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
    this.enterKey.on('down', (event) => {
      this.onEnterMessage();
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
    const message = chatbox.value;
    chatbox.value = '';

    this.scene.client.emit('chatMessage', {
      message: this.scene.player.username + ': ' + message,
      lobbyId: this.scene.lobbyId,
    });
  };
}
