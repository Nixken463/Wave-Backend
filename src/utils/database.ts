import { sql, SQL, type ReservedSQL } from "bun"
import ConnectionPool from "./connectionPool"
class Database {
  public connection: ReservedSQL
  public pool
  private isReleased: boolean= false
  public constructor(connection: ReservedSQL,) {
    this.connection = connection
    this.pool = ConnectionPool.getInstance()
  }
  public async reserve() {
    this.connection = await this.pool.reserve()
    this.isReleased = false
  }
  public release() {
    this.connection.release()
    this.isReleased = true
  }
  public checkIfReleased():boolean{
    return this.isReleased
  }


  public async select(
    table: string,
    columns: string[] = ["*"],
    where: Record<string, any> = {}) {
    let query = `SELECT ${columns.join(', ')} FROM ${table}`
    const params: any[] = [];

    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where)
        .map(key => `${key} = ?`)
        .join(' AND ');
      query += ` WHERE ${conditions}`
      params.push(...Object.values(where))
    }

   try {
      const result = await this.connection.unsafe(query, params)
      return result
    } catch (error) {
      console.error(error)
    }
  }
  //intended only for complex queries, for simple ones use the respective functions
  public async query(query:TemplateStringsArray, ...values:any[]){
    try {
      const result = await this.connection(query, ...values)
      return result  
    } catch (error) {
      console.error(error)
    }
  }
  public async insert(
    table: string,
    values: Record<string, string | number>,
    returnId:boolean = false) {
    const keys = Object.keys(values);

    if (keys.length === 0) {
      throw new Error("Insert values cannot be empty");
    }

    const columns = keys.join(", ");
    const placeholders = keys.map(() => "?").join(", ");
    const params = Object.values(values);
    try{
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const result = await this.connection.unsafe(query, params);

    if (returnId) {
      const select = await this.connection`SELECT LAST_INSERT_ID()`
      const insertId = select[0]["LAST_INSERT_ID()"]
      return insertId
    }
    return result
    }
    catch(error){
      console.error(error)
    }
  }
 


}
export default Database