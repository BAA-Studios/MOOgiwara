// @ts-ignore
import cardMetadata from '../cards/metadata.json' assert { type: 'json' };

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
    }

    isCharacterCard() {
        return this.category === 'CHARACTER';
    }
}