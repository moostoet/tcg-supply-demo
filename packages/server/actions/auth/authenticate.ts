import { loginUserRequestS, loginUserResponseS } from "../../../shared/schemas/user/login";
import { AuthService } from "../../lib/types";
import { zodAction } from "../../lib/zodAction";

export const authenticate = zodAction({
    params: loginUserRequestS,

    response: loginUserResponseS,

    async handler(this: AuthService, ctx) {

        return {
            email: "yes",
            id: "yes",
        }
    }
})