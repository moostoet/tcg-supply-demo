import { MongoServerError } from "mongodb";
import { createUserRequestS, createUserResponseS } from "../../../shared/schemas/user/register";
import { AuthService } from "../../lib/types";
import { zodAction } from "../../lib/zodAction";
import User from "../../schemas/User";
import * as F from "../../lib/functions";
import { UserEntitySafe } from "../../services/users.service";
import * as argon2 from "argon2";
import { T, both, cond, identity, is, whereEq } from "ramda";
import { DuplicateFieldError } from "../../lib/errors/DuplicateFieldError";

const isMongoError: (e: unknown) => e is MongoServerError = is(MongoServerError);
const isDuplicateError = (e: unknown): e is MongoServerError => both(isMongoError, whereEq({ code: 11000 }))(e)

const createDuplicateFieldError = F.create(DuplicateFieldError);

export const register = zodAction({
    params: createUserRequestS,

    response: createUserResponseS,

    async handler(this: AuthService, ctx): Promise<UserEntitySafe> {
        try {
            ctx.params.password = await argon2.hash(ctx.params.password);
            const user = await User.create(ctx.params);
            return {
                email: user.email,
                id: user._id.toString()
            }
        } catch (error: unknown) {
            throw cond([
                [isDuplicateError, createDuplicateFieldError],
                [T, identity]
            ])(error)
        }
    }
})