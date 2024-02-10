import { Errors } from "moleculer";

export class InvalidCredentialsError extends Errors.MoleculerError {
    constructor(data?: unknown) {
        super("Invalid credentials", 401, "INVALID_CREDENTIALS", data);
    }
}