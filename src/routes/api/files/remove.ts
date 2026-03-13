import { Hono } from "hono";
import type { Env } from "src/types/hono";
import Responses from "src/utils/responses";
const remove = new Hono<Env>

remove.delete('/:fileId', async (c) => {
    const db = c.get('db')
    const senderId = c.get('userId')
    const fileId = c.req.param('fileId')
    const r = new Responses(c)

    const filedata = await db.select("files", ["userId"], { "fileId": fileId })
    if (filedata.length === 0) {
        return r.error("FileDoesNotExist", 400)
    }

    if (senderId !== filedata[0].userId) {
        return r.error("MissingPermissions", 403)

    }
    db.remove("files", { "fileId": fileId })
    db.remove("attachments", { "fileId": fileId })
    return r.success(200)
  
})

export default remove
