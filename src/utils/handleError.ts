import axios, { AxiosError } from "axios";

// Function to handle Axios errors
function handleAxiosError(error: AxiosError): void {
    console.error("ZATCA API Error:", error.response?.data || error.message);
}

// Function to handle generic Error objects
function handleGenericError(error: Error): void {
    console.error("ZATCA API Error:", error.message);
}

// Function to handle unexpected errors
function handleUnexpectedError(error: unknown): void {
    console.error("ZATCA API Error:", error);
}

// Function to check and handle the error type
export function handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
        handleAxiosError(error);  // Handle Axios errors
    } else if (error instanceof Error) {
        handleGenericError(error);  // Handle generic Error objects
    } else {
        handleUnexpectedError(error);  // Handle unexpected errors
    }
}