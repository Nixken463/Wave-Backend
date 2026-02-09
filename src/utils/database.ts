import { SQL, type ReservedSQL } from "bun"
import ConnectionPool from "./connectionPool"
class Database {
  public connection:ReservedSQL
  public pool
  public constructor(connection: ReservedSQL,) {
    this.connection = connection
    this.pool = ConnectionPool.getInstance()
  }
  public async reserve() {
     this.connection = await this.pool.reserve()
  }
  public release() {
     this.connection.release()
  }


  public async select(
    table: string,
    columns: string[] = ["*"],
    where: Record<string, any> = {}) {
    let query = `SELECT ${columns.join(', ')} FROM ${table}`;
    const params: any[] = [];

    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where)
        .map(key => `${key} = ?`)
        .join(' AND ');
      query += ` WHERE ${conditions}`;
      params.push(...Object.values(where));
    }

    const result = await this.connection.unsafe(query, params);
    return result;
  }

  public async insert(
    table: string,
    values: Record<string, string>) {
    const keys = Object.keys(values);

    if (keys.length === 0) {
      throw new Error("Insert values cannot be empty");
    }

    const columns = keys.join(", ");
    const placeholders = keys.map(() => "?").join(", ");
    const params = Object.values(values);

    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const result = await this.connection.unsafe(query, params);
    return result;
  }

}
export default Database