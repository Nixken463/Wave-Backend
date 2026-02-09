import { Glob } from "bun" 
import { basename, resolve } from "node:path" 
import { pathToFileURL } from "node:url" 
import { Hono } from "hono" 
import databaseMiddleware from "src/middleware/databaseMiddleware"
import type { Env } from "src/types/hono"
class Router {
    private app: Hono<Env> 

    constructor(app: Hono<Env>) {
        this.app = app
        this.app.use('*', databaseMiddleware)
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
            

            console.log("Loaded:", routePath) 
            this.app.route(routePath, module.default) 
        }
        console.log("\n All routes loaded")
        console.log("-".repeat(30)) 
    }
}

export default Router 
