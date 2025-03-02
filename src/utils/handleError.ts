import axios, { AxiosError } from "axios";
import { logger } from "./logger"; 

// Function to handle Axios errors
function handleAxiosError(error: AxiosError, sessionId: string, source: string, customMessage: string): void {
    const message = error.response?.data || error.message;
    const statusCode = error.response?.status;
    logger("error", `${source}`, `${customMessage} Status: ${statusCode}, Message: ${message}`, sessionId);
}

// Function to handle generic Error objects
function handleGenericError(error: Error, sessionId: string, source: string, customMessage: string): void {
    logger("error", `${source}`, `${customMessage} Message: ${error.message}`, sessionId);
}

// Function to handle unexpected errors
function handleUnexpectedError(error: unknown, sessionId: string, source: string, customMessage: string): void {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    logger("error", `${source}`, `${customMessage} Error: ${errorMessage}`, sessionId);
}

// General function to handle errors
export function handleError(error: unknown, source: string, customMessage?: string, sessionId?: string): void {
    if (axios.isAxiosError(error)) {
        handleAxiosError(error, source, sessionId, customMessage);  // Handle Axios errors
    } else if (error instanceof Error) {
        handleGenericError(error, source, sessionId, customMessage);  // Handle generic Error objects
    } else {
        handleUnexpectedError(error, source, sessionId, customMessage);  // Handle unexpected errors
    }
}
