import { z } from "zod";

export const createUserRequestS = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const createUserResponseS = z.object({
    email: z.string(),
    id: z.string(),
});

export type CreateUserRequest = z.infer<typeof createUserRequestS>;
export type CreateUserResponse = z.infer<typeof createUserResponseS>;