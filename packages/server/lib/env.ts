import { z } from 'zod'

const envSchema = z.object({
  COOKIE_SECRET: z.string().min(16)
})

/* cspell:disable-next-line - We want to allow process.env here only */
export const Env = envSchema.parse(process.env)

