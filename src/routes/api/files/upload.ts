import { Hono } from 'hono'
import type { Env } from 'src/types/hono'
import { verifyFileSchema } from 'src/utils/verifySchema'
import { uploadSchema } from 'src/schema/files/uploadSchema'
import Responses from 'src/utils/responses'
import Files from 'src/utils/files'
const upload = new Hono<Env>

upload.post('/', async (c) => {
    const r = new Responses(c)
    const db = c.get('db')
    const files = new Files(db)
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
    if (!await files.testFileSize(body)) {
        return r.error("FileTooLarge", 400)
    }
    const saveResult = await files.save(c, body)
    return saveResult

})


export default upload


