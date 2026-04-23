import { Hono } from "hono";
import type { Env } from "src/types/hono";
import Responses from "src/utils/responses";
import Auth from "src/utils/auth";
const messages = new Hono<Env>

messages.get("/", async (c) => {
    const r = new Responses(c)
    const db = c.get('db')
    const auth = new Auth(db)
    const userId = c.get('userId').toString()
    const conversationId = c.req.param("conversationId")
    const limit = c.req.query("limit") ?? "30"
    const offset = c.req.query("offset") ?? "0"

    if (!conversationId) {
        return r.error("MissingConversationId", 400)
    }
    const inConversation = await auth.userInConversation(conversationId, userId)
    if (!inConversation) {
        return r.error("UserNotInConversation", 403)
    }
    const messages = await db.query`SELECT * FROM messages WHERE conversationId = ${conversationId} ORDER BY createdAt DESC LIMIT ${limit} OFFSET ${offset}`
    return r.data(messages, 200)

})
export default messages