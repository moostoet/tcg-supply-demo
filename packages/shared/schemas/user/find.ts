
import { z } from "zod";


export const findUserRequestS = z.object({
    email: z.string().email(),
});

export const findUserResponseS = z.object({
    email: z.string(),
    password: z.string(),
    id: z.string(),
});

export type FindUserRequest = z.infer<typeof findUserRequestS>;
export type FindUserResponse = z.infer<typeof findUserResponseS>;