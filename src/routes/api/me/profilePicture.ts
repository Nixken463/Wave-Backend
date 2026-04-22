import { Hono } from "hono"
import type { Env } from "src/types/hono"
import Files from "src/utils/files"
const profilePicture = new Hono<Env>

profilePicture.get("/", async (c) =>{
    const userId = c.get('userId').toString()
    const db = c.get('db')
    const files = new Files(db)
    return files.serve(c,userId,"",true)
 
})
export default profilePicture