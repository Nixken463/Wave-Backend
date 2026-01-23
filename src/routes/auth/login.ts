import { Hono } from 'hono'

const login = new Hono()

login.get("/", (c) => c.text("Welcome"))
export default login