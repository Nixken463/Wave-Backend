import type { ServerWebSocket } from "bun";
import Database from "src/utils/database";
import ConnectionPool from "src/utils/connectionPool";
import type { WSData } from "src/types/wsdata";
import type { activeUserMap } from "src/types/activeUserMap";
import type { messages } from "src/types/messages";

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

    try {
        //check if both users are in a conversation
        const con = await ConnectionPool.getInstance().reserve()
        const db = new Database(con)
        const result = await db.select('conversations', ["*"], { "conversationId": conversationId })
        const recipients: Set<string> = new Set(
            result.map((row: { userId: string }) => row.userId.toString())
        )

        if (!recipients.has(senderId)) {
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



}
export default sendMessage