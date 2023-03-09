import { Types } from 'mongoose';

// Subdocument definition:
export default interface Decks {
    _id: Types.ObjectId;
    deck_string: string;
}
/* export const deckSchema = new Schema({
    deck_string: String,
});

export const Deck = model("Deck", deckSchema); */