import { Hono } from 'hono'
import Database from '../../../utils/database'
import Auth from '../../../utils/auth'
import { verifySchema } from '../../../utils/verifySchema'
import { registerSchema } from '../../../schema/auth/registerSchema'

const db = Database.getInstance()
const register = new Hono()
const auth = new Auth()

register.post('/', async (c) => {
  const validate = await verifySchema(c, registerSchema)

  //check if validate returned either an Error Response Object or the Request Body
  if ('headers' in validate) {
    return validate
  }
  const username: string = validate.username.trim().toLowerCase()
  const password: string = validate.password.trim()
  const hash = await auth.hashPassword(password)
  const token = await auth.createToken()

  try {
    const result = await db.insert("users", {
      'username': username,
      'passwordHash': hash,
      'token': token
    })

    return c.json({ "success": true }, 201)

  }
  catch (error) {

    if (error instanceof Error) {
      const err = error as Error & { errno?: number }

      if (err.errno === 1062) {
        return c.json({
          "success": false,
          "error": "Username already exists"
        }, 409)
      }
      console.log(error)
      return c.json({
        "success": false,
        "error": "Registration failed"
      }, 500)

    }
  }



})


export default register
