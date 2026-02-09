import { Hono } from 'hono'
import { verifySchema } from 'src/utils/verifySchema'
import { loginSchema } from 'src/schema/auth/loginSchema'
import Auth from 'src/utils/auth'
import type { Env } from 'src/types/hono'
const login = new Hono<Env>

login.post('/', async (c) => {
  const body = await verifySchema(c, loginSchema)

  if ('headers' in body) {
    return body
  }
  const db = c.get('db')
  const auth = new Auth(db)

  const username = body.username.trim().toLowerCase()
  const sentPassword = body.password.trim()
  const os: string = body.os.trim()
  const isValid = await auth.verifyPassword(username, sentPassword)

  if (!isValid) {
    return c.json({
      "success": false,
      "errors": "WrongCredentials"
    }, 401)
  }

  const user = await db.select("users", ["userId"], { "username": username })
  const userId = user[0].userId
  const token = await auth.createToken()
  await db.insert("devices", {
    "userId": userId,
    "os": os,
    "token": token,
  })


  return c.json({
    "success": true,
    "token": token
  }, 200)

})


export default login


