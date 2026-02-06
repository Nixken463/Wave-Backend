import { Hono } from 'hono'
import Database from '../../../utils/database'
import Auth from '../../../utils/auth'


const db = Database.getInstance()
const register = new Hono()
const auth = new Auth()

register.post('/', async (c) => {
  const body = await c.req.json()
  const isValid = await auth.checkPasswordRequirements(body.password)
  if (!isValid) {
    return c.json({
      "success": false,
      "error": "Password does not match requirements"
    }, 422)
  }
  const hash = await auth.hashPassword(body.password)
  const username = body["username"].trim()
  const token = auth.createToken()

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
