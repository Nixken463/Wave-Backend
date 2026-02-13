import Database from "./database";
import { randomBytes } from "node:crypto";
class Auth {
  private db:Database
  constructor(db:Database) {

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
  async verifyToken(username: string, token: string): Promise<boolean> {
    const userid = await this.db.select("users", ["userid"], { "username": username })
    const row = await this.db.select("devices", ["token"], { "userid": userid })

    if (row.length === 0) {
      return false
    }
    for (const device of row) {
      if (device.token === token) {
        return true
      }
    }
    return false
  }

}

export default Auth
