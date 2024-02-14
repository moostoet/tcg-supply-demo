import { MongoServerError } from "mongodb";
import { CreateUserResponse, createUserRequestS, createUserResponseS } from "../../../shared/schemas/user/register";
import { AuthService } from "../../lib/types";
import { zodAction } from "../../lib/zodAction";
import * as F from "../../lib/functions";
import { UserEntitySafe } from "../../services/users.service";
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
            const user: CreateUserResponse = await this.broker.call("users.create",
                { email: ctx.params.email, password: ctx.params.password });

            return {
                email: user.email,
                id: user.id.toString()
            }
        } catch (error: unknown) {
            throw cond([
                [isDuplicateError, createDuplicateFieldError],
                [T, identity]
            ])(error)
        }
    }
})