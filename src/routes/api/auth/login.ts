import { Hono } from 'hono'
import Auth from '../../../utils/auth'
import Database from '../../../utils/database'

const login = new Hono
const auth = new Auth()
const db = Database.getInstance()

login.post('/', async (c) => {
  const body = await c.req.json()
  const username = body.username.trim().toLowerCase()
  const sentPassword = body.password.trim()
  const isValid = await auth.verifyPassword(username, sentPassword)

  if (!isValid) {
    return c.json({
      "success": false,
      "error": "Wrong credentials"
    }, 401)
  }
  const row = await db.select("users", ["token"], { "username": username })
  const token = row[0].token

  return c.json({
    "success": true,
    "token": token
  }, 200)



})


export default login


