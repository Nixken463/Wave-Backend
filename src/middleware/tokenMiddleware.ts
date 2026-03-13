import type { Context, Next } from 'hono'
import Auth from 'src/utils/auth'
import Responses from 'src/utils/responses'
export default async function tokenMiddleware(c: Context, next: Next) {
    const r = new Responses(c)
    const db = c.get('db')
    const bearer = c.req.header('Authorization')
    if (!bearer) {
        return r.error("MissingToken", 400)
    }
    const token = bearer.replace("Bearer", "").trim()
    try {

        const result = await new Auth(db).checkToken(token)
        if (result.success === false) {
            return r.error("InvalidToken", 401)
        }
        const userId = result.userId
        c.set('token', token)
        c.set('userId', userId)
        await next()
    }
    catch (error) {
        console.log(error)
        return r.error("InternalServerError", 500)

    }


}
