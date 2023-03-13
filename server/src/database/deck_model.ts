import { Types } from 'mongoose';

// Subdocument definition:
export default interface IDecks {
    _id: Types.ObjectId;
    name: string;
    deck_string: string;
}