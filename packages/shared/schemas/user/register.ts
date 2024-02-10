import { z } from "zod";

export const createUserRequestS = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const createUserResponseS = z.object({
    email: z.string(),
    id: z.string(),
});

export type CreateUserResponse = z.infer<typeof createUserResponseS>;