import { Schema, Model, model, Types, Document } from 'mongoose';
import IDecks from './deck_model';

// Document definition:
export interface IPlayerData extends Document {
    googleId?: string;
    name?: string;
    email: string;
    decks: IDecks[];
    createdAt: Date;
    bannedTill: Date;
}

// TMethodsAndOverrides
type PlayerDataDocumentProps = {
    googleId: string;
    name: string;
    email: string;
    decks: Types.DocumentArray<IDecks>;
    createdAt: Date;
    bannedTill: Date;
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
    })],
    bannedTill: Date
}, {
    timestamps: { createdAt: true, updatedAt: false }
}));