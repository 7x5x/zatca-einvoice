import { logError, throwErrorObject } from "./errorType";
import { saveInvoice } from "./removeChars";



interface ErrorResponse {
    status: number;
    data: any;
}

export const handleInvoiceError = (
    error: any,
    signedXmlString: string,
    invoiceHash: string
) => {
    const base64Invoice = Buffer.from(signedXmlString).toString("base64");
    saveInvoice("error.xml", base64Invoice);
    let status, data;


    error.status == 202
        ? ({ status, data } = error as ErrorResponse)
        : ({ status, data } = error.response as ErrorResponse);

    if (status === 202) {
        const warningMessages = error.data.validationResults?.warningMessages || [];
        const warningMessage = warningMessages
            .map((msg: any) => msg.message)
            .join("; ");

        logError({
            Statcode: status,
            message: warningMessage,
        });

        throwErrorObject(
            {
                Statcode: status,
                ...error.data,
            },
            false
        );
    }

    if (status === 401) {
        logError({
            Statcode: status,
            message: `${error.message} Unauthorized`,
        });

        throwErrorObject(
            {
                Statcode: status,
                message: "Unauthorized",
            },
            false
        );
    }

    if (error.response) {
        const errorMessages =
            error.response.data.validationResults?.errorMessages || [];
        const errorMessage =
            errorMessages.length > 0
                ? errorMessages.map((msg: any) => msg.message).join("; ")
                : data.message;

        logError({
            Statcode: status,
            message: errorMessage,
        });
        throwErrorObject(
            {
                Statcode: status,
                ...error.response.data,
            },
            false
        );
    } else if (error.request) {
        // The request was made but no response was received
        logError({
            Statcode: 500,
            message: "No response received from server",
            invoiceHash,
        });
    } else {
        // Something happened in setting up the request that triggered an Error
        logError({
            Statcode: status || 500,
            message: error.message || "Error in setting up the request",
            invoiceHash,
        });
    }
};
