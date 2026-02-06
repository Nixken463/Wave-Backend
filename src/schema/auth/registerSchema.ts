import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string()
    .min(3, "UsernameTooShort")
    .max(32, "UsernameTooLong")
    .regex(/^[a-zA-Z0-9_]+$/, "UsernameContainsSpecialCharacter"),
    
  password: z.string()
    .min(8, "PasswordTooShort")
    .max(64, "PasswordTooLong")
    .refine(val => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), "PasswordContainsNoSpecialCharacter")
    .refine(val => /\d/.test(val), "PasswordContainsNoNumbers")
})
