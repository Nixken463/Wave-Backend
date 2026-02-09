import { SQL } from "bun";

class ConnectionPool {
  private static instance: ConnectionPool;
  private connectionPool;

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

  public static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool();
    }
    return ConnectionPool.instance;
  }

  public async reserve() {
    return await this.connectionPool.reserve()
  }
 
  


}
export default ConnectionPool;
