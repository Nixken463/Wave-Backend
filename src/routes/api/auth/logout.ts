import { Hono } from "hono";
import type { Env } from "src/types/hono";
import Responses from "src/utils/responses";
const logout = new Hono<Env>


logout.post("/", async (c) => {
    const r = new Responses(c)
    const db = c.get('db')
    const token = c.get('token')
    await db.remove('devices', { "token": token })
    return r.returnSuccess(200)
})

export default logout