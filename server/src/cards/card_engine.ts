/*
* This files represents any card logic that is related to playing the card
*/
import { Card } from '../game/card';
import Player from '../game/player';

export function playCard(player: Player, card: Card) {
    // Check if the player has enough Don!! to play this card
    if (player.getUnrestedDonLeft() < card.cost) {
        console.log("[ERROR] Potential Player Cheating/Desync: Not enough Don!! to play card");
        return;
    }
    // Broadcast in chat that the player played this card
    player.game?.broadcastChat(`${player.username} played: \n"${card.name}"`);
    // Rest the Don!! that was used to play this card
    player.restDon(card.cost);
    player.game?.broadcastPacketExceptSelf("opponentUpdateDonArea", { 
        cards: player.donArea.list() 
    }, player);

    if (card.isCharacterCard()) {
        player.characterArea.push(card);
    } else {
        player.trash.push(card);
    }
    // TODO: Check if the card has RUSH attribute, if so, then set summoningSickness to false
    card.summoningSickness = true;
    
    // TODO: Add logic for onPlay effects, etc...

    // Remove the card from the player's hand
    player.hand.remove(card);
    // Update player's hand and opponent's view
    player.hand.update(player.client);
    player.game?.broadcastPacketExceptSelf("opponentRemoveCardFromHand", { amount: 1 }, player);

    // Update the player's and opponent's character area
    player.characterArea.update(player.client);
    // Create an array of cardIds from the player's character area
    player.game?.broadcastPacketExceptSelf("opponentUpdateCharacterArea", { 
        cards: player.characterArea.list(),
    }, player);
}