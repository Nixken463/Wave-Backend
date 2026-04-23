import { Hono } from "hono";
import type { Env } from "src/types/hono";
import Responses from "src/utils/responses";
const username = new Hono<Env>

username.get("/", async (c) => {
    const userId =  c.req.param("userId")
    const r = new Responses(c)
    if (!userId) {
        return r.error("MissingParameters",400)
    }
    const db = c.get('db')
    const result = await db.select('users', ['username'], {'userId': userId})
    return r.data(result,200)
})
export default username