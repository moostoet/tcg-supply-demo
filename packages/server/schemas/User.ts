import { Schema, model } from "mongoose";

export type IUser = {
    email: string;
    password: string;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const User = model<IUser>('User', UserSchema);

export default User;