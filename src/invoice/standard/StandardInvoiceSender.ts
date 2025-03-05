// src/invoice/standard/StandardInvoiceSender.ts
import { ZATCAInvoiceProps } from '../../types/invoice.interface'; 
import { BaseInvoiceSender } from '../BaseInvoiceSender';

export class StandardInvoiceSender extends BaseInvoiceSender {
    async send(invoice: ZATCAInvoiceProps): Promise<any> {//type SignedInvoice
       
        // Convert invoice to XML
        const { signedInvoiceString, invoiceHash, qr } = this.signInvoice(invoice);
        const base64Invoice = Buffer.from(signedInvoiceString).toString('base64');
        
        
        // Call the standard  invoice API endpoint using csid and base64 signedXml
        const cleardInvoice = await this.zatcaClient.clearInvoice(invoice.egs_info.uuid, invoiceHash, base64Invoice);
       
       
        return cleardInvoice;
    }
}
