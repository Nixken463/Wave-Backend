import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string()
    .min(1, "NoUsernameProvided")
    .max(32, "UsernameTooLong"),

  password: z.string()
    .min(1, "NoPasswordProvided")
    .max(64, "PasswordTooLong"),

  os: z.string()
    .min(1, "NoOsProvided")
    .max(32, "OsTooLong")
})
