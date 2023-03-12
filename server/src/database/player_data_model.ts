import { Schema, Model, model, Types } from 'mongoose';
import IDecks from './deck_model';

// Document definition:
export interface IPlayerData {
    googleId?: string;
    name?: string;
    email: string;
    decks: IDecks[];
    createdAt: Date;
}

// TMethodsAndOverrides
type PlayerDataDocumentProps = {
    googleId: string;
    name: string;
    email: string;
    decks: Types.DocumentArray<IDecks>;
    createdAt: Date;
};
type PlayerDataModelType = Model<IPlayerData, {}, PlayerDataDocumentProps>;

// Create model
export const PlayerData = model<IPlayerData, PlayerDataModelType>('PlayerData', new Schema<IPlayerData, PlayerDataModelType>({
    googleId: String,
    name: String,
    email: {
        type: String,
        required: true,
    },
    decks: [new Schema<IDecks>({
        deck_string: { type: String, required: true}
    })]
}, {
    timestamps: { createdAt: true, updatedAt: false }
}));

/* const playerDataSchema = new Schema({
    googleId: String,
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