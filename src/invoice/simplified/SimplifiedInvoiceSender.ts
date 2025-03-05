// src/invoice/standard/StandardInvoiceSender.ts 
import { ZATCAInvoiceProps } from '../../types/invoice.interface';
import { BaseInvoiceSender } from '../BaseInvoiceSender';

export class SimplifiedInvoiceSender extends BaseInvoiceSender {
    async send(invoice: ZATCAInvoiceProps): Promise<any> {//type SignedInvoice
        // Convert invoice to XML
        // Use your private key; in a real-world scenario, inject this or retrieve securely
        const { signedInvoiceString, invoiceHash, qr } = this.signInvoice(invoice);
        const reportedInvoice = this.zatcaClient.clearInvoice(invoice.egs_info.uuid, signedInvoiceString, invoiceHash);;
        // Call the standard invoice API endpoint using csid and signedXml
        // For example, using fetch or an HTTP client...
        return reportedInvoice;
    }
}
