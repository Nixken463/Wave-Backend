import { Hono } from "hono";
import type { Env } from "src/types/hono";
import Responses from "src/utils/responses";

const conversations = new Hono<Env>

conversations.get("/", async (c) => {
    const db = c.get('db')
    const userId = c.get('userId')
    const r = new Responses(c)
    
    const result = await db.select("conversations", ["*"], { "userId": userId })
    return r.data(result, 200)

})

export default conversations