import { ZatcaClient } from "../clients/ZatcaClient";

export class ZatcaInvoiceService {
    private zatcaClient: ZatcaClient;

    constructor(zatcaClient: ZatcaClient) {
        this.zatcaClient = zatcaClient;
    }

    /**
     * Sends a simplified invoice to ZATCA.
     * @param uuid - The UUID for the invoice.
     * @param invoiceHash - The invoice hash.
     * @param invoice - The invoice data.
     * @param cleared - Whether the invoice has been cleared or not.
     * @returns Promise<boolean> - Success or failure of the operation.
     */
    async sendSimplifiedInvoice(uuid: string, invoiceHash: string, invoice: any, cleared: boolean): Promise<boolean> {
        try {
            const result = await this.zatcaClient.reportInvoice(uuid, invoiceHash, invoice, cleared);
            console.log("Simplified invoice sent successfully:", result);
            return true;
        } catch (error) {
            console.error("Error sending simplified invoice:", error);
            return false;
        }
    }

    /**
     * Sends a standard invoice to ZATCA.
     * @param uuid - The UUID for the invoice.
     * @param invoiceHash - The invoice hash.
     * @param invoice - The invoice data.
     * @param cleared - Whether the invoice has been cleared or not.
     * @returns Promise<boolean> - Success or failure of the operation.
     */
    async sendStandardInvoice(uuid: string, invoiceHash: string, invoice: any, cleared: boolean): Promise<boolean> {
        try {
            const result = await this.zatcaClient.reportInvoice(uuid, invoiceHash, invoice, cleared);
            console.log("Standard invoice sent successfully:", result);
            return true;
        } catch (error) {
            console.error("Error sending standard invoice:", error);
            return false;
        }
    }
}
