import { ZatcaClient } from "../clients/ZatcaClient";
import { IInvoiceType } from "../zatca/signing/generateCSR";

export class ZatcaInvoiceService {

    private zatcaClient: ZatcaClient;

    constructor(zatcaClient: ZatcaClient) {
        this.zatcaClient = zatcaClient;
    }

    /**
     * Sends an invoice to ZATCA based on the invoice type.
     * @param uuid - The UUID for the invoice.
     * @param invoiceHash - The invoice hash.
     * @param invoice - The invoice data.
     * @param type - The type of the invoice.
     * @param cleared - Whether the invoice has been cleared or not.
     * @returns Promise<boolean> - Success or failure of the operation.
     */
    async sendInvoice<T>(uuid: string, invoiceHash: string, invoice: any, type: IInvoiceType, cleared: boolean): Promise<T> {
        try {
            if (type === IInvoiceType.Simplified) {
                // Call the reportInvoice method for simplified invoices
                const result = await this.zatcaClient.reportInvoice(uuid, invoiceHash, invoice, cleared);
                console.log("Simplified invoice sent successfully:", result);
                return result;
            } else {
                // Call the clearInvoice method for standard invoices
                const result = await this.zatcaClient.clearInvoice(uuid, invoiceHash, invoice, cleared);
                console.log("Standard invoice sent successfully:", result);
                return result;
            }
        } catch (error) {
            console.error("Error sending invoice:", error);
            return error;
        }
    }
}
