import { Vector } from 'js-sdsl';
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