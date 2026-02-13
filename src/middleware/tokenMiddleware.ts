import type { Context, Next } from 'hono'


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
        const result = await db.select('devices', ['*'], { 'token': token })

        if (result.length === 0) {
            return c.json({
                "success": false,
                "errors": "InvalidToken"
            }, 401)
        }
        const userId = result[0].userId
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