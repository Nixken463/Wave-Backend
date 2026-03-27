import { activeUsers } from "src/routes/websocket/handler";
class Message {
    private activeUsers
    private senderId

    public constructor(senderId: string) {
        this.senderId = senderId
        this.activeUsers = activeUsers 
    
    }
    send(recipients: Set<string>, data: Record<string, string>,messageId: string) {
        for (const entry of recipients) {
            const recipient = this.activeUsers.get(entry)
            //skip sender
            let forSender = false
            if (entry == this.senderId) {
                forSender = true
            }
            if (!recipient) {
                //ToDo send push notification
                console.log(`Recipient ${entry} is not active.`)
                continue
            }

            for (const connection of recipient) {
                if (connection.readyState === 1) {
                    if (!forSender) {
                        connection.send(JSON.stringify(data))
                        continue
                    }
                    connection.send(JSON.stringify({
                        messageId: messageId
                    }))

                }
            }
        }
    }
}

export default Message