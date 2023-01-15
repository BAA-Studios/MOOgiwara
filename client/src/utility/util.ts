import { Vector } from 'js-sdsl';
import cardMetadata from '../cards/metadata.json';

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

/** 
 *
 * given a cardId, check the metadata in public file to see if it matches a leader card
 */
export function identifyLeaderCard(cardId: string) {
  const card = cardMetadata[cardId];
  return card['Category'] === 'LEADER';
}

/*
* Algorithim stolen from: https://www.geeksforgeeks.org/find-two-rectangles-overlap/
*/
export function checkIfRectOverlap(l1, r1, l2, r2) {
    // if rectangle has area 0, no overlap
    if (l1.x == r1.x || l1.y == r1.y || r2.x == l2.x || l2.y == r2.y)
    return false;
 
    // If one rectangle is on left side of other
    if (l1.x > r2.x || l2.x > r1.x)
        return false;

    // If one rectangle is above other
    if (r1.y > l2.y || r2.y > l1.y)
        return false;

    return true;
}