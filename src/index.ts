import { Hono } from 'hono'
import Router from './utils/router'
import type { Env } from './types/hono'
import type { WSData } from './types/wsdata'
import { serve } from "bun"
import { websocketHandlers } from './routes/websocket/handler'
import Auth from './utils/auth'
import ConnectionPool from './utils/connectionPool'
import Database from './utils/database'
const app = new Hono<Env>()
const router = new Router(app)

//loads all routes in /routes
await router.load()
//start server. Send to bun websocket or hono api
const server = serve<WSData>({
    port: 3000,

    fetch: async (req, serverInstance) => {
      if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
        const authHeader = req.headers.get("Authorization")

        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("MissingToken", { status: 401 })
        }

        const token = authHeader.substring(7)

        // make db request
        const con = await ConnectionPool.getInstance().reserve()
        const db = new Database(con)
        const result =  await new Auth(db).checkToken(token)
        db.release()
        if (result.success === false){
            return new Response("InvalidToken", { status: 401 })
        }
        const userId = result.userId.toString()
        const success = serverInstance.upgrade(req, {
          data: { userId },
        })

        if (success) return
        return new Response("UpgradeFailed", { status: 400 })
      }

      return app.fetch(req)
    },

    websocket: {
      ...websocketHandlers,
      idleTimeout:0
    },
  })
