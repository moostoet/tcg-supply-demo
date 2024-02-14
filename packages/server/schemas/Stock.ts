import { Schema, Types, model } from "mongoose";

export type IStock = {
    listings: Types.ObjectId[];
}

const StockSchema = new Schema<IStock>({
    listings: { type: [Schema.Types.ObjectId], ref: 'Listing' },
});

const Stock = model<IStock>('Stock', StockSchema);

export default Stock; 