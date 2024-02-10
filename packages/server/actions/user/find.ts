import { zodAction } from "../../lib/zodAction";
import { findUserRequestS, findUserResponseS } from "../../../shared/schemas/user/find";
import User from "../../schemas/User";
import { UserNotFoundError } from "../../lib/errors/UserNotFoundError";

export const find = zodAction({
    params: findUserRequestS,

    response: findUserResponseS,

    async handler(ctx) {
        const user = await User.findOne(ctx.params);

        if (!user) {
            throw new UserNotFoundError();
        }

        return {
            email: user.email,
            password: user.password,
            id: user._id.toString(),
        }
    }
})