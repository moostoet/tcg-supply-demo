import { Errors } from "moleculer";

export class UserNotFoundError extends Errors.MoleculerError {
    constructor(data?: unknown) {
        super("User not found", 404, "USER_NOT_FOUND", data);
    }
}