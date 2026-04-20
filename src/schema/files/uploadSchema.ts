import { z } from 'zod'

export const uploadSchema = z.object({
  filename: z.string()
    .min(1, "FilenameRequired")
    .max(255, "FilenameTooLong"),

  mime: z.literal([
  //images
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",

  // documents
  "application/pdf",
  "text/plain",
  "text/markdown",

  ],
  "InvalidMime"
),

  size: z.number()
    .int()
    .positive("SizeMustBePositive")
    .max(100 * 1024 * 1024, "FileTooLarge"), //100mb
  type: z.literal(["attachment","profile_picture"],"TypeNotAllowed"),

  conversationId: z.number()
  .optional()
})
