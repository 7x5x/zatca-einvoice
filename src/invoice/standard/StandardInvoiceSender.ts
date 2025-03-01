// src/invoice/standard/StandardInvoiceSender.ts
import { ZATCATaxInvoice } from '../../zatca/templates/ZATCATaxInvoice';
import { BaseInvoiceSender } from '../BaseInvoiceSender';

export class StandardInvoiceSender extends BaseInvoiceSender {
    async send(uuid: string, invoiceHash: string, invoice: ZATCATaxInvoice): Promise<any> {//type SignedInvoice
        // Convert invoice to XML
        // Use your private key; in a real-world scenario, inject this or retrieve securely
        const signedXml = this.signInvoice(invoice);
        const cleardInvoice = {};
        // Call the standard invoice API endpoint using csid and signedXml
        // For example, using fetch or an HTTP client...
        return cleardInvoice;
    }
}
