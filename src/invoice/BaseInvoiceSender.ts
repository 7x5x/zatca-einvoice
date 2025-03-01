// src/invoice/BaseInvoiceSender.ts
import { IInvoiceSender } from './IInvoiceSender';
import { ZATCATaxInvoice } from '../zatca/templates/ZATCATaxInvoice';
import { SignInvoiceService } from '../services/SignInvoiceService';

export abstract class BaseInvoiceSender implements IInvoiceSender {
    protected signingService: SignInvoiceService;

    constructor(signingService: SignInvoiceService) {
        this.signingService = signingService;
    }
    /**
     * Converts raw invoice data into a ZATCATaxInvoice instance and signs it.
     * @param invoice The raw invoice data.
     * @returns The signed invoice data.
     */
    protected signInvoice(invoice: ZATCATaxInvoice): {
        signedInvoiceString: string;
        invoiceHash: string;
        qr: string;
    } {
        const signedInvoice = this.signingService.signInvoice(invoice);
        return {
            signedInvoiceString: signedInvoice.signed_invoice_string,
            invoiceHash: signedInvoice.invoice_hash,
            qr: signedInvoice.qr
        };
    }


    abstract send(uuid: string, invoiceHash: string, invoice: ZATCATaxInvoice): Promise<any>;//type SignedInvoice
}
