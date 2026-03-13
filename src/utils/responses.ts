import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
class Responses {
    private c
    public constructor(c: Context) {
        this.c = c
    }
    returnError(error: string, statusCode: ContentfulStatusCode): Response {
        return this.c.json(
            {
                "success": false,
                "error": error
            },
            statusCode
        )
    }

    returnSuccess(statusCode:ContentfulStatusCode):Response{
        return this.c.json(
            {
                "success":true,
            },
            statusCode
        )
    }

    returnPayload(payload:string,statusCode:ContentfulStatusCode):Response{
            return this.c.json(
            {
                "success":true,
                "payload":payload
            },
            statusCode
        )
    }
}   

export default Responses