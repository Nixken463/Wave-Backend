import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
class Responses {
    private c: Context
    public constructor(c: Context) {
        this.c = c
    }
    error(error: string | string[], statusCode: ContentfulStatusCode): Response {
        return this.c.json(
            {
                "error": error
            },
            statusCode
        )
    }

    success(statusCode: ContentfulStatusCode): Response {
        return this.c.json(
            {
            },
            statusCode
        )
    }

    data(data: string, statusCode: ContentfulStatusCode): Response {
        return this.c.json(

            data
            ,
            statusCode
        )
    }
}

export default Responses
