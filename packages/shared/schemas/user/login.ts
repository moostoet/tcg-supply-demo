import { z } from "zod";

export const loginUserRequestS = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const loginUserResponseS = z.object({
    email: z.string(),
    id: z.string(),
});

export type LoginUserRequest = z.infer<typeof loginUserRequestS>;
export type LoginUserResponse = z.infer<typeof loginUserResponseS>;