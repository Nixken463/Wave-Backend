import type { ServerWebSocket } from "bun";
import type { WSData } from "src/types/wsdata";
import type { activeUserMap} from "src/types/activeUserMap";
import type { messages } from "src/types/messages";
import sendMessage from "./sendMessage";
import updateMessage from "./updateMessage";

export const activeUsers:activeUserMap = new Map()

export const websocketHandlers = {
  open(ws: ServerWebSocket<WSData>) {
    const userId = ws.data.userId;
    if (userId) {
      if (!activeUsers.has(userId)) {
        activeUsers.set(userId, new Set())
      }
      activeUsers.get(userId)!.add(ws)
    }
  },

  async message(ws: ServerWebSocket<WSData>, message: string | Buffer) {
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
    if (data.messageId){
      updateMessage(ws,data)
      return
    }

    await sendMessage(ws,data,activeUsers)

  },

  close(ws: ServerWebSocket<WSData>) {
    const userId = ws.data.userId.toString()
    const connections = activeUsers.get(userId)
    if (!connections) return
    //remove connection
    connections.delete(ws)
    //remove user from active if no connections
    if (connections.size === 0) {
      activeUsers.delete(userId)
    }
  },
};