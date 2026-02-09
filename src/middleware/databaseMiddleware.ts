import type { Context, Next } from 'hono'
import ConnectionPool from 'src/utils/connectionPool'
import Database from 'src/utils/database'
import type { Env } from 'src/types/hono'

export default async function databaseMiddleware(c: Context<Env>, next: Next) {
  const pool = ConnectionPool.getInstance()
  const connection = await pool.reserve()
  c.set('db', new Database(connection))
  try {
    await next()
  } finally {
    await connection.release()
  }
}

