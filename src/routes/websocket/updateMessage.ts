import type { ServerWebSocket } from "bun";
import type Database from "src/utils/database";
import type { WSData } from "src/types/wsdata";
import type { messages } from "src/types/messages";
import Message from "src/utils/message";
import Auth from "src/utils/auth";

async function updateMessage(ws: ServerWebSocket<WSData>, data: messages, db: Database) {
    const senderId = ws.data.userId
    const exists = await db.select('messages', ['senderId'], { 'messageId': data.messageId })
    const message = new Message(senderId)
    const auth = new Auth(db)
    const conversationId = data.conversationId
    if (exists.length === 0) {
        ws.send(JSON.stringify({
            error: "MessageDoesNotExist"
        }))
        return
    }
    if (senderId != exists[0].senderId) {
        ws.send(JSON.stringify({
            error: "PermissionDenied"
        }))
        return
    }
    const recipients = await auth.userInConversation(conversationId, senderId)

    message.send(recipients!, data, data.messageId!)
    ws.send(JSON.stringify({
        messageId: data.messageId,
        content: data.content

    }))
    const updateTime = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Berlin' }).replace('T', ' ');
    //ToDo update database entry
    await db.update('messages', { 'content': data.content || "", 'updatedAt': updateTime }, { 'messageId': data.messageId! })
    return
}
export default updateMessage