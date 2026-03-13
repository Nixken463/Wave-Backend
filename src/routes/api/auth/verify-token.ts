import { Hono } from 'hono'
import type { Env } from 'src/types/hono'

const verifyToken = new Hono<Env>

verifyToken.get("/", async (c) => {
    return c.json({
        "success": true
    }, 200)
})
export default verifyToken