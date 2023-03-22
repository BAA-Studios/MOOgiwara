import Phaser from "phaser";
import GameBoard from "../scenes/game_board";

export default class ChatHandler {
  scene: GameBoard;
  messages: string[];
  textInput: Phaser.GameObjects.DOMElement;
  chat: Phaser.GameObjects.Text;
  chatIndex: number // This is the number the chat is rendered from and beyond
  enterKey: Phaser.Input.Keyboard.Key;

  constructor(scene: GameBoard) {
    this.scene = scene;
    this.messages = [];
    this.textInput = this.scene.add.dom(1724, 900).createFromCache('chatbox');
    this.chat = this.scene.add.text(1500, 110, '', {
      lineSpacing: 15,
      backgroundColor: '#FFFFFF',
      color: '#000000',
      fontStyle: 'bold',
    });
    this.chat.padding.top = 10;
    this.chat.padding.left = 10;
    this.chat.padding.right = 10;
    this.chatIndex = 0;
    this.chat.setFixedSize(400, 750).setInteractive();
    this.enterKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );

    // Make it so the chat is scrollable
    this.chat.on('wheel', (_, __, dx: number, ___: number, ____: number) => {
      if (this.messages.length <= 24) { // Max number of messages that can be rendered
        return;
      }
      if (dx > 0) { // User is scrolling down
        if (this.messages.length - this.chatIndex <= 24) { // If we are at the bottom of the chat
          return;
        }
        this.chatIndex++;
      }
      else if (dx < 0) {// User is scrolling up
        if (this.chatIndex === 0) { // If we are at the top of the chat
          return;
        }
        this.chatIndex--;
      }
      this.chat.setText(this.returnTextToRender());
    });

    this.scene.player.client.on('chatMessage', (data: any) => {
      console.log(data.message);
      let messageArray = data.message.split('\n');
      for (let i = 0; i < messageArray.length; i++) {
        this.messages.push(messageArray[i]);
      }
      if (this.messages.length >= 25) {
        this.chatIndex += messageArray.length;
      }
      this.chat.setText(this.returnTextToRender());
    });
  }

  initChat = () => {
    this.enterKey.on('down', () => {
      this.onEnterMessage();
    });

    // If they click outside of the input box, then we want to unfocus the input box
    this.scene.input.on('pointerdown', (event) => {
      if (event.target !== 'chat') {
        const el = <HTMLInputElement>document.getElementById("chat");
        el.blur();
      }
    });
  };

  onEnterMessage = () => {
    const chatbox = (<HTMLInputElement>this.textInput.getChildByName("chat"));
    if (chatbox === null) {
      return;
    }
    if (chatbox.value === "") {
      return;
    }
    let message = chatbox.value;
    const copyMessage = message;
    chatbox.value = '';

    const maxLength = 33;
    const lines: string[] = [];

    while (message.length >= maxLength) {
      lines.push(message.substring(0, maxLength));
      message = message.substring(maxLength);
    }

    if (maxLength * lines.length < copyMessage.length) {
      lines.push(copyMessage.substring(maxLength * lines.length));
      message = lines.join('\n');
    }

    console.debug(`Player: ${this.scene.player}; ${this.scene.player.username}`);
    this.scene.player.client.emit('chatMessage', {
      message: this.scene.player.username + ': ' + message,
      lobbyId: this.scene.lobbyId,
    });
  };

  returnTextToRender() {
    let messageToRender = '';
    for (let i = this.chatIndex; i < this.messages.length; i++) {
      messageToRender += this.messages[i] + '\n';
    }
    return messageToRender;
  }
}
