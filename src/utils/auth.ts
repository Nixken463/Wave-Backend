import Database from "./database";
import { randomBytes } from "node:crypto";
import type { checkToken } from "src/types/checkToken";
class Auth {
  private db: Database
  constructor(db: Database) {

    this.db = db
  }


  async hashPassword(password: string): Promise<string> {
    return Bun.password.hash(password)
  }
  async verifyPassword(username: string, password: string): Promise<boolean> {
    try {
      const result = await this.db.select('users', ['passwordHash',], { 'username': username })
      if (!result || result.length === 0) return false

      const passwordHash = result[0].passwordHash
      const isVerified = await Bun.password.verify(password, passwordHash)
      if (!isVerified) {
        return false
      }
      return true
    }
    catch (error) {
      console.log(error)
      return false
    }
  }

  async createToken(): Promise<string> {
    let token: string = ""
    let tokenAlreadyExists: boolean = true
    while (tokenAlreadyExists) {
      token = randomBytes(32).toString('hex')
      const row = await this.db.select("devices", ["token"], { "token": token })
      if (row.length === 0) {
        tokenAlreadyExists = false
      }
    }
    return token

  }
  async checkToken(token: string): Promise<checkToken> {
    const result = await this.db.select('devices', ['*'], { 'token': token })
    if (result.length === 0) {
      return {
        "success": false,
        "userId": ""
      }
    }
    return {
      "success": true,
      "userId": result[0].userId

    }
  }
  async userInConversation(conversationId: string, userId: string): Promise<undefined | Set<string>> {
    const result = await this.db.select('conversations', ["*"], { "conversationId": conversationId })
    const recipients: Set<string> = new Set(
      result.map((row: { userId: string }) => row.userId.toString())
    )
    if (!recipients.has(userId)) {
      return
    }
    return recipients
  }


}

export default Auth
