import { Types } from 'mongoose';

// Subdocument definition:
export default interface IDecks {
    _id: Types.ObjectId;
    deck_string: string;
}
/* export const deckSchema = new Schema({
    deck_string: String,
});

export const Deck = model("Deck", deckSchema); */