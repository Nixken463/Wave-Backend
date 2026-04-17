import { mkdir } from "node:fs/promises";
class Logger {
    private static instance: Logger
    private constructor() {
    }
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }
    async log(error:any) {
        const date = await this.createDir()
        const time = new Date().toLocaleTimeString()
        const path = `logs/${date}/${time}`
        await Bun.write(path, error + "\n");
    }
    async createDir() {
        const now = new Date();

        const date = [
            String(now.getDate()).padStart(2, "0"),
            String(now.getMonth() + 1).padStart(2, "0"),
            now.getFullYear()
        ].join("-");
        await mkdir(`logs/${date}`, { recursive: true })
        return date
    }
}

export default Logger