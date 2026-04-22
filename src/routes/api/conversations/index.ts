import { Hono } from "hono";
import type { Env } from "src/types/hono";
import { verifySchema } from "src/utils/verifySchema";
import { createConversationSchema } from "src/schema/conversations/createConversationSchema";
import Responses from "src/utils/responses";
const createConversation = new Hono<Env>

createConversation.post("/", async (c) => {
    const r = new Responses(c)
    const body = await verifySchema(c, createConversationSchema)
    if ('headers' in body) {
        return body
    }

    const userId = body.userId
    
    if (!userId || userId.length === 0) {
        return r.error("MissingParameters", 400)
    }
    const personalUserId = c.get('userId')
    const db = c.get('db')
    const userExists = await db.select('users', ['*'], {'userId':userId})
    if (!userExists || userExists.length === 0){
        return r.error("UserDoesNotExist",400)
    }

    const alreadyExists = await db.query`
        SELECT conversationId
        FROM conversations
        WHERE userId IN (${personalUserId}, ${userId})
        GROUP BY conversationId
        HAVING COUNT(DISTINCT userId) = 2;
    `
    if (alreadyExists.length !== 0) {
        return r.error("UsersAlreadyHaveAConversation", 409)
    }
    const conversationId = await db.insert('conversations', { 'userId': personalUserId }, true)
    await db.insert('conversations', { 'conversationId': conversationId, 'userId': userId })
    return r.data({"conversationId":conversationId},201)
})


export default createConversation