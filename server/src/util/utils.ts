import { Vector } from 'js-sdsl';
import { uniqueNamesGenerator, NumberDictionary, Config, adjectives, animals } from 'unique-names-generator';
// @ts-ignore
import cardMetadata from '../cards/metadata.json' assert { type: 'json' };
import { Card } from '../game/card';

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
 * Deck String format: `set`.`card_number`.`quantity`/
 * Cards that are alternate art are indicated by the following: `set_altNum`.`card_number`.`quantity`./
 * 
 * A deck with a doflamingo leader and 4 perona alt arts would look like:
 * st03.009.1/op01_1.077.4/
 * 
 * Colors are indicated by the following: r, blu, g, p, bla... SEE: card_color.ts
 */
export function parseDeckString(deckString: string): string[] {
  let cards = deckString.split('/');
  let result: string[] = [];
  for (let card of cards) {
    let cardInfo = card.split('.');

    // the set identifier can look like: st03_1 where 1 is the altArtId
    let setInfo = cardInfo[0].split('_');
    let set = setInfo[0];
    let altArtId = "";

    if (setInfo.length > 1) {
      altArtId = setInfo[1];
    }

    let cardNumber = cardInfo[1];
    let cardId = set.toUpperCase() + '-' + cardNumber;
    let quantity = cardInfo[2];

    for (let i = 0; i < parseInt(quantity); i++) {
      let cardToPush = cardId;
      if (altArtId !== "") {
        cardToPush += '_p' + altArtId;
      }
      result.push(cardToPush);
    }
  }
  return result;
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

/**
* This function parses a list of Card Objects into a deck_string
*/
export function parseDeckToString(_: Card[]): string {
  return ""
}

/**
 * This function parses a list of cardIds into a deck_string
 * Following the format: `set_altNum`.`card_number`.`quantity`.`color`/
 * Example: st03_1.009.1/op01_1.077.4/
 */
export function parseCardListToString(deckList: string[]): string {
  let result = "";
  let visited: Set<string> = new Set();
  for (let cardId of deckList) {
    if (visited.has(cardId)) {
      continue;
    }
    // cardID Example: ST01-001_p1, STO01-002
    let cardInfo = cardId.split('-'); // ['ST01', '001_p1']
    let set = cardInfo[0].toLowerCase();

    let numbers = cardInfo[1].split('_'); // ['001', 'p1']
    let cardNumber = numbers[0];
    let altArtId = "";

    if (numbers.length > 1) {
      altArtId = numbers[1][1];
    }
    let quantity = deckList.filter((id) => id === cardId).length;

    result += set;
    if (altArtId !== "") {
      result += '_' + altArtId;
    }
    result += '.' + cardNumber + '.' + quantity + '/';
    visited.add(cardId);
  }
  return result
}