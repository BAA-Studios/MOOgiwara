import { Schema, Model, model, Types } from 'mongoose';
import Decks from './deck_model';

// Document definition:
interface PlayerData {
    google_id: string;
    name: string;
    email: string;
    decks: Decks[];
    createdAt: Date;
}

// TMethodsAndOverrides
type PlayerDataDocumentProps = {
    google_id: string;
    name: string;
    email: string;
    decks: Types.DocumentArray<Decks>;
    createdAt: Date;
};
type PlayerDataModelType = Model<PlayerData, {}, PlayerDataDocumentProps>;

// Create model
const PlayerDataModel = model<PlayerData, PlayerDataModelType>('PlayerData', new Schema<PlayerData, PlayerDataModelType>({
    google_id: String,
    name: String,
    email: {
        type: String,
        required: true,
    },
    decks: [new Schema<Decks>({
        deck_string: String
    }, {
        timestamps: { createdAt: true, updatedAt: false }
    })]
}));

export default PlayerDataModel;

/* const playerDataSchema = new Schema({
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

export const PlayerData = model("PlayerData", playerDataSchema); */