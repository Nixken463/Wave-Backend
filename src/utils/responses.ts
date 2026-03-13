import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
class Responses {
    private c: Context
    public constructor(c: Context) {
        this.c = c
    }
    error(error: string, statusCode: ContentfulStatusCode): Response {
        return this.c.json(
            {
                "success": false,
                "error": error
            },
            statusCode
        )
    }

    success(statusCode: ContentfulStatusCode): Response {
        return this.c.json(
            {
                "success": true,
            },
            statusCode
        )
    }

    data(data: string, statusCode: ContentfulStatusCode): Response {
        return this.c.json(
            {
                "success": true,
                "data": data
            },
            statusCode
        )
    }
}

export default Responses
