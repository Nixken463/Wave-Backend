import type { Context } from 'hono'
import { ZodType } from 'zod'

export async function verifySchema(c: Context, schema: ZodType) {
  let body
  try {
    body = await c.req.json()
  }
  catch {
    return c.json({
      "success": false,
      "error": "InvalidJSON"
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
    }, 400)
  }
  return body
}
export async function verifyFileSchema(c: Context, schema:ZodType, data:any){
  const result = await schema.safeParseAsync(data)

  
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
  return true
}
