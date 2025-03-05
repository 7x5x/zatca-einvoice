// src/invoice/standard/StandardInvoiceSender.ts 
import { ZATCAInvoiceProps } from '../../types/invoice.interface';
import { BaseInvoiceSender } from '../BaseInvoiceSender';

export class SimplifiedInvoiceSender extends BaseInvoiceSender {
    async send(invoice: ZATCAInvoiceProps): Promise<any> {//type SignedInvoice

        // Convert invoice to XML
        const { signedInvoiceString, invoiceHash, qr } = this.signInvoice(invoice);
        const base64Invoice = Buffer.from(signedInvoiceString).toString('base64');


        // Call the standard  invoice API endpoint using csid and base64 signedXml
        const reportedInvoice = await this.zatcaClient.reportInvoice(invoice.uuid, invoiceHash, base64Invoice);


        return reportedInvoice;
    }
}
