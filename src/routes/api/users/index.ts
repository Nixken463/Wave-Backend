import { Hono } from "hono";
import type { Env } from "src/types/hono";
import Responses from "src/utils/responses";
const searchUsers = new Hono<Env>

searchUsers.get("/", async (c) =>{
    const db = c.get('db')
    const r = new Responses(c)
    const username = c.req.query('username')
    const userId = c.get('userId')
    if (!username || username.length === 0){
        return r.error("MissingParams", 400)
    }
    const result = await db.query`SELECT username,userId FROM users WHERE username LIKE ${username + "%"} AND userId != ${userId} LIMIT 10`
    return r.data(result,200)
})
export default searchUsers