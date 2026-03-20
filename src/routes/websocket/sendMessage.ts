import type { ServerWebSocket } from "bun";
import Database from "src/utils/database";
import ConnectionPool from "src/utils/connectionPool";
import type { WSData } from "src/types/wsdata";
import type { activeUserMap } from "src/types/activeUserMap";
import type { messages } from "src/types/messages";
import Auth from "src/utils/auth";
import Message from "src/utils/message";
async function sendMessage(ws: ServerWebSocket<WSData>, data: messages, activeUsers: activeUserMap) {
    const senderId = ws.data.userId
    const content = data.content as string
    const fileId = data.fileId as string
    const conversationId = data.conversationId
    const con = await ConnectionPool.getInstance().reserve()
    const db = new Database(con)
    const auth = new Auth(db)
    try {
        //check if both users are in a conversation
        const recipients = await auth.userInConversation(conversationId, senderId)
        if (!recipients) {
            ws.send(JSON.stringify({
                type: "error",
                error: "UserNotInConversation"
            }))
            return
        }

        const createMessage = await db.insert('messages', {
            "conversationId": conversationId,
            "senderId": senderId,
            "content": content || null

        }, true)
        if (fileId) {
            try {

                await db.insert('attachments', {
                    "messageId": createMessage,
                    "fileId": Number(fileId)
                })
            }
            catch (error) {
                ws.send(JSON.stringify({
                    type: "error",
                    error: "FileDoesNotExist"
                }))
                return
            }
        }
        const message = new Message(senderId, activeUsers)
        //send message
        message.send(recipients, { content, senderId, conversationId, fileId })




    }
    catch (error) {
        console.log(error)

    }
    finally {
        db.release()
    }



}
export default sendMessage