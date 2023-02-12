/*
* This file is respresents a networked list of cards
* This object is used to sync the cards between the client and server
*/
import { Card } from './card';
import { Vector } from 'js-sdsl';
import { Socket } from 'socket.io';
import { shuffle } from '../util/utils';

export class SyncCardList {
    private _cards: Vector<Card> = new Vector<Card>();
    type : string;

    constructor(type: string, cardIds: string[] = []) {
        cardIds.forEach(cardId => {
            this._cards.pushBack(new Card(cardId));
        });
        this.type = type;
    }

    push(card: Card) {
        this._cards.pushBack(card);
    }

    pop() {
        return this._cards.popBack();
    }

    popTopCard() {
        return this.removeAt(0);
    }

    pushToFront(card: Card) {
        this._cards.insert(0, card);
    }
    
    removeAt(index: number) {
        const cardRemoved = this._cards.getElementByPos(index);
        this._cards.eraseElementByPos(index);
        return cardRemoved;
    }

    remove(card: Card) {
        this._cards.eraseElementByValue(card);
        return card
    }

    shuffle() {
        shuffle(this._cards);
    }

    size() {
        return this._cards.size();
    }

    empty() {
        return this._cards.empty();
    }

    clear() {
        this._cards.clear();
    }

    extend(cards: Vector<Card>) {
        for (let card of cards) {
            this._cards.pushBack(card);
        }
    }

    list() {
        return this._cards;
    }

    get(index: number) {
        return this._cards.getElementByPos(index);
    }

    cards() {
        return this._cards;
    }

    getCardFromObjectId(objectId: number) {
        for (let card of this._cards) {
            if (card.objectId === objectId) {
                return card;
            }
        }
        return undefined;
    }

    insertAt(index: number, card: Card) {
        this._cards.insert(index, card);
    }

    /*
    * This function updates the client on the cards within this list
    */
    update(socket: Socket) {
        socket.emit('updateCardList', {
            cards: this._cards,
            type: this.type
        });
    }
}