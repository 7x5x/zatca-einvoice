import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
const LOGGING = process.env.LOGGING === "1";
// const LOG_FILE = "../../logs/invoice.log";
const LOG_FILE = "logs/invoice.log";

const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10 MB

export const activeSessions = new Map<string, string[]>();
export const logger = (type: string, source: string, message: string, sessionId?: string) => {
    if (!LOGGING) return;

    const currentSessionId = sessionId || crypto.randomUUID();

    const timestamp = new Date().toLocaleString();
    // const logMessage = `\x1b[33m${timestamp}\x1b[0m: [\x1b[36m${source}\x1b[0m] [\x1b[31m${type}\x1b[0m] ${message}\n`;
    const logMessage = `[${timestamp}] [${source}] [${type}] ${message} \n`;

    if (!activeSessions.has(currentSessionId)) {
        activeSessions.set(currentSessionId, []);
    }
    activeSessions.get(currentSessionId)?.push(logMessage);

    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_LOG_SIZE) {
        fs.renameSync(LOG_FILE, `${LOG_FILE}.old`);
    }

    if (source.includes("invoice numbere")) {
        fs.appendFile(LOG_FILE, "\n", (err) => {
            if (err) {
                // console.error("Error writing new line to log file:", err);
            }
        });
    }
    // Write to the log file
    fs.appendFile(LOG_FILE, logMessage, (err) => {
        if (err) {
            // console.error("Error writing to log file:", err);
        }
    });
};
