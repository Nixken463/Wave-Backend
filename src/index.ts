import { Hono } from 'hono'
import Router from './utils/router'
import Database from './utils/database'

const app = new Hono()
const router = new Router(app)

const db = Database.getInstance()


//loads all routes in /routes
await router.load()

export default app
