import { Glob } from "bun"
import { basename, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import { Hono } from "hono"
import databaseMiddleware from "src/middleware/databaseMiddleware"
import tokenMiddleware from "src/middleware/tokenMiddleware"
import type { Env } from "src/types/hono"
class Router {
    private app: Hono<Env>
    private excludedRoutes: string[]

    constructor(app: Hono<Env>) {
        this.app = app
        this.app.use('*', databaseMiddleware)
        this.excludedRoutes = ["login", "register"]

    }

    async load() {
        const glob = new Glob("src/routes/**/*.ts")

        for (const filepath of glob.scanSync()) {
            //skip the router itself
            if (basename(filepath) === "router.ts") continue

            const module = await import(
                pathToFileURL(resolve(filepath)).href
            )

            //builds url path
            let routePath = filepath
                .replace(/^src[\\/]+routes/, "")
                .replace(/\.ts$/, "")
                .replaceAll("\\", "/")

           if (!this.excludedRoutes.some(excluded => routePath.includes(excluded))) {
                this.app.use(`${routePath}/*`, tokenMiddleware)
            }
            
            console.log("Loaded:", routePath)
            this.app.route(routePath, module.default)
        }
        console.log("\n All routes loaded")
        console.log("-".repeat(30))
    }
}

export default Router 
