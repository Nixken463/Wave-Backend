import { Hono } from 'hono'
import Database from '../../../utils/database'
import Password from '../../../utils/password'


const db = Database.getInstance()
const register = new Hono()
const password = new Password()

register.get('/', async (c) => {
  const user = await db.select("users")
  console.log(user)
})

register.post('/', async (c) => {
  const body = await c.req.json()
  const hash = await password.hash(body.password)
  const username = body["username"]
  try {
    const result = await db.insert("users", {
      'username': username,
      'passwordHash': hash
    })
    c.status(200)
    return c.text("OK")

  }
  catch (error) {
    console.log(error)
    c.status(500)
    return c.text("Registration failed")
  }



})


export default register
