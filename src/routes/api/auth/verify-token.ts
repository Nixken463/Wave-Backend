import { Hono } from 'hono'
import type { Env } from 'src/types/hono'
import Responses from 'src/utils/responses'
const verifyToken = new Hono<Env>

verifyToken.get("/", async (c) => {
    const r = new Responses(c)
    return r.success(200)
 
})
export default verifyToken
