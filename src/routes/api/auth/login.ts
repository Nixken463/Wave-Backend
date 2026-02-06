import { Hono } from 'hono'
import Auth from '../../../utils/auth'

const login = new Hono
const auth = new Auth()

login.post('/', async (c) => {
  const body = await c.req.json()
  const username = body.username
  const sentPassword = body.password
  const isValid = await auth.verifyPassword(username, sentPassword)

  if (!isValid) {
    return c.json({
      "success": false,
      "error": "Wrong credentials"
    }, 401)
  }
  //add token logic
  return c.json({ "success": true }, 200)



})


export default login


