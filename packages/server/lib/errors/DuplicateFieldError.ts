import { Errors } from "moleculer";

export class DuplicateFieldError extends Errors.MoleculerError {
    constructor(data?: unknown) {
        super("Duplicate field", 422, "DUPLICATE_FIELD", data);
    }
}