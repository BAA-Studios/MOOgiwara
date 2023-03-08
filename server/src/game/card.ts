// @ts-ignore
import cardMetadata from '../cards/metadata.json' assert { type: 'json' };
import { Vector } from 'js-sdsl';

export class Card {
    id: string;
    objectId: number = 0;
    name: string;
    life: number;
    cost: number;
    category: string;
    attribute: string;
    power: number;
    counter: string;
    color: string;
    type: string;
    effect: string;
    trigger: string;
    cardSets: string;

    isResting = false;
    summoningSickness = false;
    isBlocker: boolean = false;

    attachedDon: Vector<Card> = new Vector<Card>();
    attachedDonCount = 0;

    constructor(cardId: string) {
        this.id = cardId;
        // Check if the cardId exists within the metaData if not throw an error
        if (!cardMetadata[cardId]) {
            throw new Error(`Card ID: ${cardId} does not exist in the metadata`);
        }
        this.name = cardMetadata[cardId]['Name'];
        this.life = cardMetadata[cardId]['Life']; // If the card is a leader, this is the life of the leader
        this.cost = cardMetadata[cardId]['Cost'];
        this.category = cardMetadata[cardId]['Category'];
        this.attribute = cardMetadata[cardId]['Attribute'];
        this.power = cardMetadata[cardId]['Power'];
        this.counter = cardMetadata[cardId]['Counter'];
        this.color = cardMetadata[cardId]['Color'];
        this.type = cardMetadata[cardId]['Type'];
        this.effect = cardMetadata[cardId]['Effect'];
        this.trigger = cardMetadata[cardId]['Trigger'];
        this.cardSets = cardMetadata[cardId]['Card Set(s)'];

        this.summoningSickness = false;
        this.isBlocker = this.effect.includes('[Blocker] (After your opponent declares an attack, you may rest this card to make it the new target of the attack.)');
    }

    isCharacterCard() {
        return this.category === 'CHARACTER';
    }

    isEventCard() {
        return this.category === 'EVENT';
    }

    isEventCounterCard() {
        return this.isEventCard() && this.effect.startsWith('[Counter]');
    }

    calculateBonusAttackFromDon() {
        return 0 * this.attachedDon.size();
    }

    getBaseAttack() {
        return this.power;
    }

    getTotalAttack() {
        return this.getBaseAttack() + this.calculateBonusAttackFromDon();
    }

    addDon(card: Card) {
        this.attachedDonCount++;
        this.attachedDon.pushBack(card);
    }

    removeDon(card: Card) {
        this.attachedDonCount--;
        this.attachedDon.eraseElementByValue(card);
    }

    clearDon() {
        this.attachedDonCount = 0;
        this.attachedDon.clear();
    }
}