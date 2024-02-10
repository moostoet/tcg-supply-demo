
import { z } from "zod";


export const getUserRequestS = z.object({
    id: z.string(),
});

export const getUserResponseS = z.object({
    email: z.string(),
    id: z.string(),
});

export type GetUserRequest = z.infer<typeof getUserRequestS>;
export type GetUserResponse = z.infer<typeof getUserResponseS>;