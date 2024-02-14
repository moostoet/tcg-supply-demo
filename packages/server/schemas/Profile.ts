import { Schema, model } from "mongoose";
import { required } from "../lib/functions";
import { IStock } from "./Stock";

export type IProfile = {
    name: string;
    lastname: string;
    dateOfBirth: Date;
    addressDetails: string;
    stock: IStock;
}

const ProfileSchema = new Schema<IProfile>({
    name: required(String),
    lastname: required(String),
    dateOfBirth: required(Date),
    addressDetails: required(String),
    stock: { type: Schema.Types.ObjectId, ref: 'Stock' },
});

const Profile = model<IProfile>('Profile', ProfileSchema);

export default Profile;