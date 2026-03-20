import type { ServerWebSocket } from "bun";
import Database from "src/utils/database";
import ConnectionPool from "src/utils/connectionPool";
import type { WSData } from "src/types/wsdata";
import type { activeUserMap } from "src/types/activeUserMap";
import type { messages } from "src/types/messages";
import Auth from "src/utils/auth";
async function sendMessage(ws: ServerWebSocket<WSData>, message: string | Buffer, activeUsers: activeUserMap) {
    let data
    try {
        data = JSON.parse(message.toString()) as messages
    }
    catch (error) {
        ws.send(JSON.stringify({
            type: "error",
            error: "InvalidJson"
        }))
        return
    }
    const senderId = ws.data.userId
    const content = data.content
    const fileId = data.fileId
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
        //send message
        for (const entry of recipients) {
            const recipient = activeUsers.get(entry)
            //skip sender
            if (entry == senderId) continue
            if (!recipient) {
                //ToDo send push notification
                console.log(`Recipient ${entry} is not active.`)
                continue
            }

            for (const connection of recipient) {
                if (connection.readyState === 1) {
                    connection.send(JSON.stringify({
                        content,
                        conversationId,
                        senderId,
                    }));
                }
            }

        }



    }
    catch (error) {
        console.log(error)

    }
    finally {
        db.release()
    }



}
export default sendMessage