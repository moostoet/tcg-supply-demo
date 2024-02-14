import z from 'zod'

export const APIErrorS = z.object({
  code: z.number(),
  type: z.string(),
  retryable: z.boolean(),
})

export type APIError = z.infer<typeof APIErrorS>
