import { Hono } from 'hono'
import type { Env } from 'src/types/hono'
import { verifyFileSchema } from 'src/utils/verifySchema'
import { uploadSchema } from 'src/schema/files/uploadSchema'
import testFileSize from 'src/utils/files'
const upload = new Hono<Env>

upload.post('/', async (c) => {

    const db = c.get('db')
    const host = process.env.USER
    const body = await c.req.parseBody()
    const metadata = {
        filename: body.filename,
        mime: body.mime,
        size: Number(body.size),
        type: body.type
    }
    const result = await verifyFileSchema(c, uploadSchema, metadata)
    if (result !== true) {
        return result
    }

    const filedata = body.file as File
    const fileType = body.type as string
    const userId = c.get('userId').toString()
    const filename = body.filename as string
    const mime = body.mime as string
    const filesize = parseInt(body.size as string, 10)


    if (filedata) {
        try {
            if (!await testFileSize(filedata.size, fileType)) return c.json({ "success": false, "errors": "FileTooLarge" })

            const insertResult = await db.insert("files", {
                "userId": userId,
                "filename": filename,
                "mime": mime,
                "size": filesize,
                "type": fileType
            }, true)
            if (insertResult.length === 0) return c.json({ "success": false, "errors": "InternalServerError" }, 500)
            const fileId: number = insertResult
            const basepath = `/home/${host}/files/`
            const filebuffer = await filedata.arrayBuffer()
            let filepath: string
            //Save file under userId if profile_picture, else save under conversationId
            if (body.type === "profile_picture") {
                filepath = `${basepath}users/${userId}/${fileId}`
            }
            else {
                if (!body.conversationId) {
                    return c.json({
                        "success": false,
                        "errors": "MissingConversationId"
                    })
                }
                filepath = `${basepath}conversation/${body.conversationId}/${fileId}`
            }
            await Bun.write(filepath, filebuffer, { createPath: true })

            return c.json({
                "success": true
            }, 200)
        }
        catch (error) {
            return c.json({
                "success": false,
                "error": error
            }, 500)
        }

    }
    return c.json({
        "success": false,
        "error": "FileUploadError"
    })
})


export default upload


