import { Hono } from 'hono'
import Router from './routes/utils/router'

const app = new Hono()
const router = new Router(app)

await router.load()

export default app
