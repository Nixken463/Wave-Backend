import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string()
    .max(32, "UsernameTooLong"),

  password: z.string()
    .max(64, "PasswordTooLong"),

  os: z.string()
})
