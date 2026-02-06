import { Hono } from 'hono'
import Router from './utils/router'

const app = new Hono()
const router = new Router(app)


//loads all routes in /routes
await router.load()

export default app
