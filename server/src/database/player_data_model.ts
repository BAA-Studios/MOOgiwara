import mongoose from 'mongoose';
import { deckSchema } from './deck_model';

const { Schema } = mongoose;
const playerDataSchema = new Schema({
    google_id: String,
    name: String,
    email: {
        type: String,
        required: true,
    },
    decks: [deckSchema],  // opt for embed instead of reference because 1-to-Many
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

export const PlayerData = mongoose.model("PlayerData", playerDataSchema);