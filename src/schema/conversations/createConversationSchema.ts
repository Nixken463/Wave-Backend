import { z } from 'zod'

export const createConversationSchema = z.object({
  userId: z.string()
    .min(1, "MissingUserId")

})
