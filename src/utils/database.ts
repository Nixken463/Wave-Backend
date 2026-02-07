import { sql, SQL, type ReservedSQL } from "bun";

class Database {
  private static instance: Database;
  private connectionPool: SQL;

  private constructor() {
    this.connectionPool = new SQL({
      adapter: "mysql",
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,

      max: 20,
      idleTimeout: 30,
      maxLifetime: 0,
      connectionTimeout: 30,
    });


  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async reserve() {
    return await this.connectionPool.reserve()
  }


  public async select(
    table: string,
    columns: string[] = ["*"],
    where: Record<string, any> = {},
    connection = this.connectionPool) {
    let query = `SELECT ${columns.join(', ')} FROM ${table}`;
    const params: any[] = [];

    if (Object.keys(where).length > 0) {
      const conditions = Object.keys(where)
        .map(key => `${key} = ?`)
        .join(' AND ');
      query += ` WHERE ${conditions}`;
      params.push(...Object.values(where));
    }

    const result = await connection.unsafe(query, params);
    return result;
  }

  public async insert(
    table: string,
    values: Record<string, string>,
    connection = this.connectionPool) {
    const keys = Object.keys(values);

    if (keys.length === 0) {
      throw new Error("Insert values cannot be empty");
    }

    const columns = keys.join(", ");
    const placeholders = keys.map(() => "?").join(", ");
    const params = Object.values(values);

    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    console.log(query)
    const result = await connection.unsafe(query, params);
    return result;
  }


}
export default Database;
