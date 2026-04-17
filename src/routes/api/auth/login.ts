import { Hono } from 'hono'
import { verifySchema } from 'src/utils/verifySchema'
import { loginSchema } from 'src/schema/auth/loginSchema'
import Auth from 'src/utils/auth'
import type { Env } from 'src/types/hono'
import Responses from 'src/utils/responses'
const login = new Hono<Env>

login.post('/', async (c) => {
  const r = new Responses(c)
  const body = await verifySchema(c, loginSchema)
  console.log(body)
  if ('headers' in body) {
    return body
  }
  const db = c.get('db')
  const auth = new Auth(db)

  const username = body.username.trim().toLowerCase().replaceAll(" ", "_")
  const sentPassword = body.password.trim()
  const os: string = body.os.trim()
  const isValid = await auth.verifyPassword(username, sentPassword)
  console.log(c)
  if (!isValid) {
    return r.error("WrongCredentials", 401)
  }

  const result = await db.select("users", ['userId'], { "username": username })
  const userId = result[0].userId
  const token = await auth.createToken()
  await db.insert("devices", {
    "userId": userId,
    "os": os,
    "token": token,
  })

  return r.data({token}, 200)


})


export default login


