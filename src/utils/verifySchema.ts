import type { Context } from 'hono'
import { ZodType } from 'zod'
import Responses from './responses'
export async function verifySchema(c: Context, schema: ZodType) {
  let body
  const r = new Responses(c)
  try {
    body = await c.req.json()
  }
  catch {
    return r.error("InvalidJSON",400)
    
  }
  const result = await schema.safeParseAsync(body)

  if (!result.success) {
    let errorList: string[] = []
    const errors = result.error.issues

    for (const code of errors) {
      const errorMessage = code.message
      errorList.push(errorMessage)
    }
    return r.error(errorList,400)
   
  }
  return body
}
export async function verifyFileSchema(c: Context, schema:ZodType, data:any){
  const result = await schema.safeParseAsync(data)
  const r = new Responses(c)

  
  if (!result.success) {
    let errorList: string[] = []
    const errors = result.error.issues

    for (const code of errors) {
      const errorMessage = code.message
      errorList.push(errorMessage)
    }
    return r.error(errorList,401)

  }
  return true
}
