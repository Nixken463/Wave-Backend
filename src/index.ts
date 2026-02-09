import { Hono } from 'hono'
import Router from './utils/router'
import type { Env } from './types/hono'
const app = new Hono<Env>()
const router = new Router(app)


//loads all routes in /routes
await router.load()

export default app
