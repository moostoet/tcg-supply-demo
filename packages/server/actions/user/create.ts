import { zodAction } from "../../lib/zodAction";
import { UserEntitySafe } from "../../services/users.service";
import User from "../../schemas/User";
import { T, both, cond, identity, is, pick, whereEq } from "ramda";
import * as F from "../../lib/functions";
import { MongoServerError } from "mongodb";
import { DuplicateFieldError } from "../../lib/errors/DuplicateFieldError";
import { UsersService } from "../../lib/types";
import { createUserRequestS, createUserResponseS } from "../../../shared/schemas/user/register";
import * as argon2 from "argon2";

const isMongoError: (e: unknown) => e is MongoServerError = is(MongoServerError);
const isDuplicateError = (e: unknown): e is MongoServerError => both(isMongoError, whereEq({ code: 11000 }))(e)

const createDuplicateFieldError = F.create(DuplicateFieldError);

export const create = zodAction({
    rest: "POST /",
    params: createUserRequestS,

    response: createUserResponseS,

    async handler(this: UsersService, ctx): Promise<UserEntitySafe> {
        try {
            ctx.params.password = await argon2.hash(ctx.params.password);
            const user = await User.create(ctx.params);
            return { ...user, id: user._id.toString() };
        } catch (error: unknown) {
            throw cond([
                [isDuplicateError, createDuplicateFieldError],
                [T, identity]
            ])(error)
        }
    }
})