import type { activeUserMap } from "src/types/activeUserMap";
class Message {
    private activeUsers
    private senderId
    public constructor(senderId: string, activeUsers: activeUserMap) {
        this.senderId = senderId
        this.activeUsers = activeUsers
    }
    send(recipients: Set<string>,data:Record<string,string>) {
        for (const entry of recipients) {
            const recipient = this.activeUsers.get(entry)
            //skip sender
            if (entry == this.senderId) continue
            if (!recipient) {
                //ToDo send push notification
                console.log(`Recipient ${entry} is not active.`)
                continue
            }

            for (const connection of recipient) {
                if (connection.readyState === 1) {
                   connection.send(JSON.stringify(data))
                }
            }
        }
    }
}

export default Message