//card mongoose schema: title, rarity, holoState, specialStatus, printDate

import { Schema, model } from "mongoose";

export type ICard = {
    title: string;
    rarity: string;
    holoState: boolean;
    specialStatus: string;
    printDate: Date;
}

const CardSchema = new Schema<ICard>({
    title: { type: String, required: true },
    rarity: { type: String, required: true },
    holoState: { type: Boolean, required: true },
    specialStatus: { type: String, required: true },
    printDate: { type: Date, required: true },
});

const Card = model<ICard>('Card', CardSchema);

export default Card;