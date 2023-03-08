import mongoose from 'mongoose';

const { Schema } = mongoose;
export const deckSchema = new Schema({
    deck_string: String,
});

export const Deck = mongoose.model("Deck", deckSchema);