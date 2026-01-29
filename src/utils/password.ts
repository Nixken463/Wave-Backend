import Database from "./database"

class Password {
  private db;
  constructor() {
    this.db = Database.getInstance()
  }
  hash(password: string):Promise<string> {
    return Bun.password.hash(password)
  }
  async verify(token: string, password: string): Promise<boolean> {
    try {
      const result = await this.db.select('users', ['password',], { 'token': token })
      if (!result || !result.row || result.length === 0) return false

      const hashPassword = result[0].password
      const isVerified = Bun.password.verify(password, hashPassword)
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
}

export default Password
