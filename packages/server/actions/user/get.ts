import { docToPojo, normaliseOId } from "../../lib/functions";
import { zodAction } from "../../lib/zodAction";
import { getUserRequestS, getUserResponseS } from "../../../shared/schemas/user/get";
import User, { IUser } from "../../schemas/User";
import { UserNotFoundError } from "../../lib/errors/UserNotFoundError";
import { andThen, pick, pipe, tap, when } from "ramda";
import * as RA from "ramda-adjunct";
import { HydratedDocument } from "mongoose";
const pickUserProps = pick(['email', 'password', 'id'])

const normalise = pipe(
    docToPojo,
    normaliseOId<HydratedDocument<IUser>>,
    pickUserProps,
)

const fetchUser = (id: string) => User.findById(id);
const pipeline = pipe(
    fetchUser,
    andThen(tap(console.dir)),
    andThen(
        when(RA.isNilOrEmpty, () => { throw new UserNotFoundError() })
    ),
    andThen(normalise),
)

export const get = zodAction({
    params: getUserRequestS,

    response: getUserResponseS,

    async handler(ctx) {
        return await pipeline(ctx.params.id);
    }
})