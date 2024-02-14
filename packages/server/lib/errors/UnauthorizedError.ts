import { Errors } from "moleculer";

export class UnauthorizedError extends Errors.MoleculerError {
    constructor(data?: unknown) {
        super("Unauthorized", 401, "UNAUTHORIZED", data);
    }
}