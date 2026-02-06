import type { Context } from 'hono'
import { z, ZodType } from 'zod'

export async function verifySchema(c: Context, schema: ZodType) {
  let body
  try {
    body = await c.req.json()
  }
  catch {
    return c.json({
      "success": false,
      "error": "Invalid JSON"
    }, 400)
  }
  const result = await schema.safeParseAsync(body)

  if (!result.success) {
     
    const errors = result.error.flatten()
    return c.json({
      "success": false,
      errors
    }, 401)
  }
  return body
}
