import { Hono } from 'hono'
import Auth from '../../../utils/auth'
import Database from '../../../utils/database'
import { verifySchema } from '../../../utils/verifySchema'
import { loginSchema } from '../../../schema/auth/loginSchema'

const login = new Hono
const auth = new Auth()
const db = Database.getInstance()

login.post('/', async (c) => {
  const body = await verifySchema(c, loginSchema)

  if ('headers' in body) {
    return body
  }

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

  const connection = await db.reserve()
  const user = await db.select("users", ["userId"], { "username": username }, connection)
  const userId = user[0].userId
  const token = await auth.createToken(connection)
  await db.insert("devices", {
    "userId": userId,
    "os": os,
    "token": token,
  })
  connection.release()


  return c.json({
    "success": true,
    "token": token
  }, 200)

})


export default login


