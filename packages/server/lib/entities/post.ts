import { z } from 'zod';

import { ZodObjectId } from '../schemas';

export const postSchema = z.object({
  title: z.string().min(5),
  content: z.optional(z.string()),
  createdAt: z.coerce.date().default(new Date()),
  author: ZodObjectId,
  active: z.boolean().default(true),
});

export type PostSchema = z.infer<typeof postSchema>;
