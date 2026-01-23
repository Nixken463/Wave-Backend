import { Hono } from 'hono'

const register = new Hono()

register.get("/", (c) => c.text("Registered"))
export default register