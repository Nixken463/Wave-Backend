import { Hono } from "hono";
import type { Env } from "src/types/hono";
import { stat } from 'node:fs/promises';
import Responses from "src/utils/responses";
const download = new Hono<Env>

download.get('/:fileId', async (c) => {
    const db = c.get('db')
    const fileId = c.req.param('fileId')
    const senderId = c.get('userId')
    const r = new Responses(c)

    if (!fileId) {
        return r.returnError("MissingParams", 400)
    }
    const fileResult = await db.select('files', ['filename', 'userId', 'type',], { 'fileId': fileId })

    if (fileResult.length === 0) {
        return r.returnError("FileDoesNotExist", 400)
    }
    const fileOwnerId = fileResult[0].userId
    const filetype = fileResult[0].type
    const fileMime = fileResult[0].mime
    const host = process.env.USER
    const basepath = `/home/${host}/files/`
    let path

    if (filetype !== "profile_picture") {
        const result = await db.query`
            SELECT messages.conversationId
            FROM messages
            INNER JOIN attachments ON messages.messageId = attachments.messageId
            INNER JOIN conversations ON conversations.conversationId = messages.conversationId
            WHERE attachments.fileId = ${fileId}
            AND conversations.userId = ${senderId}
`
        db.release()
        if (result.length === 0) {
            return r.returnError("MissingPermissions", 403)
        }
        const conversationId = result[0].conversationId


        path = `${basepath}conversation/${conversationId}/${fileId}`
    }
    else {
        path = `${basepath}users/${fileOwnerId}/${fileId}`

    }
    const file = Bun.file(path)
    const fileExists = await file.exists()
    if (!fileExists) {
        return r.returnError("FileNotFound", 400)
    }
    const fileStats = await stat(path)
    c.header('Content-Type', 'application/octet-stream');
    c.header('Content-Mime', fileMime);
    c.header('Content-Disposition', `attachment; filename="${fileResult[0].filename}"`);
    c.header('Content-Length', fileStats.size.toString());
    const filestream = file.stream()
    return new Response(filestream)
})
export default download

