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
    let errorList: string[] = []
    const errors = result.error.issues

    for (const code of errors) {
      const errorMessage = code.message
      errorList.push(errorMessage)
    }
    return c.json({
      "success": false,
      "errors": errorList
    }, 401)
  }
  return body
}
