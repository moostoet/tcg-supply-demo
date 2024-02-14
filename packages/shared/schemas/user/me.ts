import { z } from "zod";

export const getMeResponseS = z.object({
    email: z.string(),
    id: z.string(),
});