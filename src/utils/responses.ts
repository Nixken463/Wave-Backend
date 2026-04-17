import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
class Responses {
    private c: Context
    public constructor(c: Context) {
        this.c = c
    }
    error(errors: string | string[], statusCode: ContentfulStatusCode): Response {
        if (typeof errors === "string"){
            errors = [errors]
        }
        return this.c.json(
            {
                "errors": errors
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

    data(data: string | Record<string, unknown>, statusCode: ContentfulStatusCode): Response {
        return this.c.json(

            data
            ,
            statusCode
        )
    }
}

export default Responses
