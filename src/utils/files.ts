import type { Context } from "hono"
import type Database from "./database"
import Responses from "./responses"
import type { BodyData } from "hono/utils/body"
import { stat } from 'node:fs/promises';

class Files {
  db: Database

  public constructor(db: Database) {
    this.db = db
  }
  async save(c: Context, body: BodyData): Promise<Response> {
    const r = new Responses(c)
    const filedata = body.file as File
    const fileType = body.type as string
    const userId = c.get('userId').toString()
    const filename = body.filename as string
    const filesize = parseInt(body.size as string, 10)


    if (!filedata) {
      return r.error("InvalidFile", 422)
    }
    const insertResult = await this.db.insert("files", {
      "userId": userId,
      "filename": filename,
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
      filepath = `${basepath}users/profilePictures/${userId}.jpeg`
      
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
  async serve(c: Context, senderId: number, fileId: string = "", isProfilePicture = false) {
    const basepath = `files/`
    const r = new Responses(c)

    let filename
    let fileResult
    let path
    if (!isProfilePicture) {
      fileResult = await this.db.select('files', ['filename', 'userId', 'type',], { 'fileId': fileId })

      if (fileResult.length === 0) {
        return r.error("FileDoesNotExist", 400)
      }
      filename = fileResult[0].filename
      const result = await this.db.query`
            SELECT messages.conversationId
            FROM messages
            INNER JOIN attachments ON messages.messageId = attachments.messageId
            INNER JOIN conversations ON conversations.conversationId = messages.conversationId
            WHERE attachments.fileId = ${fileId}
            AND conversations.userId = ${senderId}
`
      console.log(result, senderId, fileId)
      this.db.release()
      if (result.length === 0) {
        return r.error("MissingPermissions", 403)
      }
      const conversationId = result[0].conversationId


      path = `${basepath}conversation/${conversationId}/${fileId}`
    }

    else {
      path = `${basepath}users/profilePictures/${senderId}.jpeg`
      filename = `${senderId}.jpeg`
    }
    const file = Bun.file(path)
    const fileExists = await file.exists()
    if (!fileExists) {
      return r.error("FileNotFound", 400)
    }
    const fileStats = await stat(path)
    c.header('Content-Type', 'application/octet-stream');
    c.header('Content-Disposition', `attachment; filename="${filename}"`);
    c.header('Content-Length', fileStats.size.toString());
    const filestream = file.stream()
    return new Response(filestream)




  }
  async testFileSize(
    body: BodyData
  ): Promise<boolean> {

    const maxSize = {
      profile_picture: 5 * 1024 * 1024,    // 5 MB
      attachment: 100 * 1024 * 1024      // 100 MB 
    }
    const fileType = body.type as string
    const fileSize = parseInt(body.size as string, 10)
    if (!(fileType in maxSize)) return false

    const maxFileSize = maxSize[fileType as keyof typeof maxSize]

    return fileSize <= maxFileSize
  }
  async exists(path: string): Promise<boolean> {
    const file = Bun.file(path)
    const exists = await file.exists()
    return exists
  }

}
export default Files


