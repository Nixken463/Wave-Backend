import type { Context, Next } from 'hono'
import Auth from 'src/utils/auth'
export default async function tokenMiddleware(c: Context, next: Next) {
    const db = c.get('db')
    const bearer = c.req.header('Authorization')
    if (!bearer) {
        return c.json({
            "success": false,
            "errors": "MissingToken"
        }, 400)
    }
    const token = bearer.replace("Bearer", "").trim()
    try {
        
        const result = await new Auth(db).checkToken(token)
        console.log(result)
        if (result.success ===false ) {
            return c.json({
                "success": false,
                "errors": "InvalidToken"
            }, 401)
        }
        const userId = result.userId
        c.set('token', token)
        c.set('userId', userId)
        await next()
    }
    catch (error) {
        console.log(error)
        return c.json({
            "success": false,
            "errors": "InternalServerError"
        }, 500)
    }


}
