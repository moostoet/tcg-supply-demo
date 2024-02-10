import { zodAction } from "../../lib/zodAction";

import { LoginUserResponse, loginUserRequestS, loginUserResponseS } from "../../../shared/schemas/user/login";
import { AuthService } from "../../lib/types";
import { FindUserResponse } from "../../../shared/schemas/user/find";
import * as argon2 from "argon2";
import * as F from "../../lib/functions";
import { InvalidCredentialsError } from "../../lib/errors/InvalidCredentialsError";
import { T, cond, identity } from "ramda";

const isInvalidCredentialsError = (e: unknown): e is Error => e instanceof InvalidCredentialsError;

const createInvalidCredentialsError = F.create(InvalidCredentialsError);

const comparePassword = async (password: string, hash: string) => {
    return await argon2.verify(hash, password);
}

export const login = zodAction({
    params: loginUserRequestS,

    response: loginUserResponseS,

    async handler(this: AuthService, ctx): Promise<LoginUserResponse> {
        try {
            const { email, password } = ctx.params;
            const user: FindUserResponse = await this.broker.call("users.find", { email },
                { meta: { includePassword: true } });


            const isMatch = await comparePassword(password, user.password);

            if (!isMatch) {
                throw new InvalidCredentialsError();
            }

            return {
                email: user.email,
                id: user.id
            }
        } catch (error: unknown) {
            throw cond([
                [isInvalidCredentialsError, createInvalidCredentialsError],
                [T, identity]
            ])(error)
        }
    }
})