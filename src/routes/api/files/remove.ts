import { Hono } from "hono";
import type { Env } from "src/types/hono";

const remove = new Hono<Env>

remove.delete('/:fileId', async (c) => {
    const db = c.get('db')
    const senderId = c.get('userId')
    const fileId = c.req.param('fileId')

    const filedata = await db.select("files", ["userId"], { "fileId": fileId })
    if (filedata.length === 0) return c.json({ "success": false, "errors": "FileDoesNotExist" }, 400)
    if (senderId !== filedata[0].userId) {
        return c.json({
            "success": false,
            "errors": "MissingPermissions"
        })
    }
    db.remove("files", { "fileId": fileId })
    db.remove("attachments", { "fileId": fileId })
    return c.json({
        "success": true,
    }, 200)
})

export default remove