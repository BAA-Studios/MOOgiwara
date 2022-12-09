import Phaser from "phaser";

export default class ChatHandler {
    scene: Phaser.Scene;
    messages: string[];
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.messages = [];
    }

    initChat = () => {
        // Add in the text input box
        const textInput = this.scene.add.dom(1135, 690).createFromCache("chatbox");
        const chat = this.scene.add.text(1000, 10, "", { lineSpacing: 15, backgroundColor: "#21313CDD", color: "#26924F", padding: 10, fontStyle: "bold" });
        chat.setFixedSize(270, 645);
    }

    onEnterMessage = (textInput) => {
        let chatbox = textInput.getChildByName("chat");
        let message = chatbox.value;
        chatbox.value = "";
        this.messages.push(message);
    }
}