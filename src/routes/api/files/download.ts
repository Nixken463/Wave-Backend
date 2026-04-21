import { Hono } from "hono";
import type { Env } from "src/types/hono";
import Responses from "src/utils/responses";
import Files from "src/utils/files";
const download = new Hono<Env>
download.get('/:fileId', async (c) => {
    const db = c.get('db')
    const fileId = c.req.param('fileId')
    const isProfilePicture = c.req.query('profile') === 'true'
    const senderId = c.get('userId')
    const r = new Responses(c)
    const files = new Files(db)

    if (!fileId && !isProfilePicture) {
        return r.error("MissingParams", 400)
    }

    return await files.serve(c,senderId,fileId,isProfilePicture)
    

})
export default download

