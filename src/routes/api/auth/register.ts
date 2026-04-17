import { Hono } from 'hono'
import Auth from 'src/utils/auth'
import { verifySchema } from 'src/utils/verifySchema'
import { registerSchema } from 'src/schema/auth/registerSchema'
import type { Env } from 'src/types/hono'
import Responses from 'src/utils/responses'
const register = new Hono<Env>()

register.post('/', async (c) => {
  const body = await verifySchema(c, registerSchema)
  const r = new Responses(c)
  //check if body returned either an Error Response Object or the Request Body
  if ('headers' in body) {
    return body
  }
  const db = c.get('db')
  const auth = new Auth(db)

  const username: string = body.username.trim().toLowerCase().replaceAll(" ", "_")
  const password: string = body.password.trim()
  const hash = await auth.hashPassword(password)

    const exists = await db.select("users", ["*"], { "username": username })

    if (exists.length > 0) {
      return r.error("UsernameAlreadyExists", 409)
    }

    await db.insert("users", {
      'username': username,
      'passwordHash': hash,
    })
    return r.success(201)

  }


)


export default register
