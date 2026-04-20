import type { Context } from "hono"
import type Database from "./database"
import Responses from "./responses"
import type { BodyData } from "hono/utils/body"
class Files {
  db: Database

  public constructor(db: Database) {
    this.db = db
  }
  async save(c: Context, body:BodyData) {
    const r = new Responses(c)
    const filedata = body.file as File
    const fileType = body.type as string
    const userId = c.get('userId').toString()
    const filename = body.filename as string
    const mime = body.mime as string
    const filesize = parseInt(body.size as string, 10)

    if (!filedata) {
      return r.error("InvalidFile",422)
    }
    const insertResult = await this.db.insert("files", {
        "userId": userId,
        "filename": filename,
        "mime": mime,
        "size": filesize,
        "type": fileType
      }, true)
      if (insertResult.length === 0) {
        return r.error("InternalServerError", 500)
      }

      const fileId: number = insertResult
      const basepath = `files/`
      const filebuffer = await filedata.arrayBuffer()
      let filepath: string
      //Save file under userId if profile_picture, else save under conversationId
      if (body.type === "profile_picture") {
        filepath = `${basepath}users/profilePictures/${userId}`
        console.log(filepath)
      }
      else {
        if (!body.conversationId) {
          return r.error("MissingConversationId", 400)
        }
        filepath = `${basepath}conversation/${body.conversationId}/${fileId}`
      }
      await Bun.write(filepath, filebuffer, { createPath: true })
      //successful upload
      return r.success(200)
  }
  async serve(c:Context){




    
  }
  async testFileSize(
    body:BodyData
  ): Promise<boolean> {

    const maxSize = {
      profile_picture: 300 * 1024,    // 300 KB
      attachment: 100 * 1024 * 1024      // 100 MB 
    }
    const fileType = body.type as string
    const fileSize = parseInt(body.size as string, 10)
    if (!(fileType in maxSize)) return false

    const maxFileSize = maxSize[fileType as keyof typeof maxSize]

    return fileSize <= maxFileSize
  }

}
export default Files


