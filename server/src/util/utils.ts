import { Vector } from 'js-sdsl';
import { uniqueNamesGenerator, NumberDictionary, Config, adjectives, animals } from 'unique-names-generator';
// @ts-ignore
import cardMetadata from '../cards/metadata.json' assert { type: 'json' };

/**
 * Shuffles a js-sdsl vector in-place, using Durstenfeld Shuffle
 * Adapted from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
export function shuffle(vector: Vector<any>): void {
  for (let i = vector.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    let temp: any;
    temp = vector.getElementByPos(i);
    vector.setElementByPos(i, vector.getElementByPos(j));
    vector.setElementByPos(j, temp);
  }
}

export function identifyLeaderCard(cardId: string) {
  const card = cardMetadata[cardId];
  return card['Category'] === 'LEADER';
}

// Name generation logic for guests 
// TODO: swap the colour+animals for One Piece character names, and reduce length to 3
const numberDictionary = NumberDictionary.generate({ length: 4 });
const nameFormat: Config = {
  dictionaries: [adjectives, animals, numberDictionary],
  separator: '',
  style: 'capital',
};

/**
 * This function generates a random name.
 * @returns A string, containing a unique name, e.g. "FluffyWhiteCat6969"
 */
export function getRandomName(): string {
  return uniqueNamesGenerator(nameFormat);
}

/**
 * This function parses a deck_string into a list of Card Objects
 * Deck String format: `set`.`card_number`.`quantity`.`color`/
 * Cards that are alternate art are indicated by the following: `set_altNum`.`card_number`.`quantity`.`color`./
 * 
 * A deck with a doflamingo leader and 4 perona alt arts would look like:
 * st03.009.1.blu/op01_1.077.4.blu/    
 * 
 * Colors are indicated by the following: r, blu, g, p, bla... SEE: card_color.ts
 */
export function parseDeckString(_: string): string[] {
  return [];
}

/**
 * Official Deck Ruling from Manual: 
 * 
 * A deck with a total of 50 cards, made up of Character cards, Event cards, and Stage cards. 
 * Your deck can only contain cards of a color included on the Leader card. 
 * Cards of a color not included on the Leader card cannot be added to your deck. 
 * Your deck can contain no more than 4 cards with the same card id. CardID = Set + "-" Card Number, e.g. "ST01-001"
 */
export function isLegalDeck(_: string): boolean {
  return true;
}