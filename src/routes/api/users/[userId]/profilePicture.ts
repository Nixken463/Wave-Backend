import { Hono } from "hono"
import type { Env } from "src/types/hono"
import Files from "src/utils/files"
import Responses from "src/utils/responses"
const profilePicture = new Hono<Env>

profilePicture.get("/", async (c) =>{
    const userId =  c.req.param("userId")
    const r = new Responses(c)
    if (!userId) {
        return r.error("MissingParameters",400)
    }
    const db = c.get('db')
    const files = new Files(db)
    return files.serve(c,userId,"",true)
 
})
export default profilePicture