import { z } from 'zod'

export const uploadSchema = z.object({
  filename: z.string()
    .min(1, "FilenameRequired")
    .max(255, "FilenameTooLong"),

  mime: z.string()
    .min(1, "FileMimeRequired")
    .max(32, "FileMimeTooLong"),

  size: z.number()
    .int()
    .positive("SizeMustBePositive")
    .max(100 * 1024 * 1024, "FileTooLarge"), //100mb
  type: z.literal(["attachment","profile_picture"],"TypeNotAllowed"),

  conversationId: z.number()
  .optional()
})
