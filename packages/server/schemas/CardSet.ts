//cardset mongoose schema: title, logo, cards

import { Schema, Types, model } from "mongoose";
import { required } from "../lib/functions";

export type ICardSet = {
    title: string;
    logo: string;
    cards: Types.ObjectId[];
}

const CardSetSchema = new Schema<ICardSet>({
    title: required(String),
    logo: required(String),
    cards: { type: [Schema.Types.ObjectId], ref: 'Card' },
});

const CardSet = model<ICardSet>('CardSet', CardSetSchema);

export default CardSet;