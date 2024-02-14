import { Schema, Types, model } from "mongoose";
import { required } from "../lib/functions";

export type IListing = {
    cards: Types.ObjectId[];
    quantity: number;
    condition: string;
    comments: string;
    media: string[];
    specialProperties: string;
    price: number;
}

const ListingSchema = new Schema<IListing>({
    cards: { type: [Schema.Types.ObjectId], ref: 'Card' },
    quantity: required(Number),
    condition: required(String),
    comments: required(String),
    media: [String],
    specialProperties: [String],
    price: required(Number),
});

const Listing = model<IListing>('Listing', ListingSchema);

export default Listing;