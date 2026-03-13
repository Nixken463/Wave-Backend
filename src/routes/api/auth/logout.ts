import { Hono } from "hono";
import type { Env } from "src/types/hono";

const logout = new Hono<Env>


logout.post("/", async (c) => {
    const db = c.get('db')
    const token = c.get('token')
    await db.remove('devices', { "token": token })
    return c.json({ 'success': true }, 200)
})

export default logout