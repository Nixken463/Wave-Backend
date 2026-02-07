import { Hono } from 'hono'
import Database from '../../../utils/database'
import Auth from '../../../utils/auth'
import { verifySchema } from '../../../utils/verifySchema'
import { registerSchema } from '../../../schema/auth/registerSchema'

const db = Database.getInstance()
const register = new Hono()
const auth = new Auth()

register.post('/', async (c) => {
  const body = await verifySchema(c, registerSchema)

  //check if body returned either an Error Response Object or the Request Body
  if ('headers' in body) {
    return body
  }
  const username: string = body.username.trim().toLowerCase()
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
