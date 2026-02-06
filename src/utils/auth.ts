import Database from "./database"

class Auth {
  private db;
  constructor() {
    this.db = Database.getInstance()
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

  async checkPasswordRequirements(password: string): Promise<boolean> {

    const requirements = {
      "hasMinLength": password.length > 8,
      "hasNumber": /\d/.test(password),
      "hasSpecialChar": /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    }
    const isValid = Object.values(requirements).every(Boolean)
    if (!isValid) {
      return false
    }
    return true
  }
  createToken() : string
  {
    const token:string = crypto.randomUUID();
    return token
  }
  //async verifyToken():string
  
}

export default Auth
