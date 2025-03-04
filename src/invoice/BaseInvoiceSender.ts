// src/invoice/BaseInvoiceSender.ts
import { IInvoiceSender } from './IInvoiceSender';
import { ZATCAInvoiceProps, ZATCATaxInvoice } from '../zatca/templates/ZATCATaxInvoice';
import { ZatcaClient } from '../clients/ZatcaClient';
import { saveInvoice } from '../utils/removeChars';

export abstract class BaseInvoiceSender implements IInvoiceSender {
    private Cirtificate: string;
    private PrivateKey: string;
    protected zatcaClient: ZatcaClient;
    constructor(
        cirtificate: string,
        privateKey: string,
        zatcaClient: ZatcaClient
    ) {
        this.Cirtificate = cirtificate;
        this.PrivateKey = privateKey;
        this.zatcaClient = zatcaClient;
    }
    /**
     * Converts raw invoice data into a ZATCATaxInvoice instance and signs it.
     * @param invoice The raw invoice data.
     * @returns The signed invoice data.
     */
    protected signInvoice(invoiceData: ZATCAInvoiceProps): {
        signedInvoiceString: string;
        invoiceHash: string;
        qr: string;
    } {

        const invoice = new ZATCATaxInvoice({ props: { ...invoiceData } }); 
        const signedInvoice = invoice.sign(this.Cirtificate, this.PrivateKey); 

        return {
            signedInvoiceString: signedInvoice.signed_invoice_string,
            invoiceHash: signedInvoice.invoice_hash,
            qr: signedInvoice.qr
        };
    }


    abstract send(invoice: ZATCAInvoiceProps): Promise<any>;//type SignedInvoice
}
 