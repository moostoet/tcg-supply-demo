import { Schema, model } from "mongoose";
import { IProfile } from "./Profile";

export type IUser = {
    email: string;
    password: string;
    profile: IProfile;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
});

const User = model<IUser>('User', UserSchema);

export default User;