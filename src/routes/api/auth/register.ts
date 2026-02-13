import { Hono } from 'hono'
import Auth from 'src/utils/auth'
import { verifySchema } from 'src/utils/verifySchema'
import { registerSchema } from 'src/schema/auth/registerSchema'
import type { Env } from 'src/types/hono'
const register = new Hono<Env>()

register.post('/', async (c) => {
  const body = await verifySchema(c, registerSchema)

  //check if body returned either an Error Response Object or the Request Body
  if ('headers' in body) {
    return body
  }
  const db = c.get('db')
  const auth = new Auth(db)

  const username: string = body.username.trim().toLowerCase().replaceAll(" ", "_")
  const password: string = body.password.trim()
  const hash = await auth.hashPassword(password)

  try {
    const result = await db.insert("users", {
      'username': username,
      'passwordHash': hash,
    })

    return c.json({ "success": true }, 201)

  }
  catch (error) {

    if (error instanceof Error) {
      const err = error as Error & { errno?: number }

      if (err.errno === 1062) {
        return c.json({
          "success": false,
          "errors": ["UsernameAlreadyExists"]
        }, 409)
      }
      console.log(error)
      return c.json({
        "success": false,
        "errors": ["RegistrationFailed"]
      }, 500)

    }
  }



})


export default register
