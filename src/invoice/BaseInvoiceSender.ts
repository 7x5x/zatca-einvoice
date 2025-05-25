// src/invoice/BaseInvoiceSender.ts
import { IInvoiceSender } from './IInvoiceSender';
import { ZATCATaxInvoice } from '../zatca/xmlGenerator/ZATCATaxInvoice';
import { ZatcaClient } from '../clients/ZatcaClient';
import { ZATCAInvoiceProps } from '../types/invoice.interface';
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
        saveInvoice("error.xml", signedInvoice.signedInvoiceString, false);
        
        return {
            signedInvoiceString: signedInvoice.signedInvoiceString,
            invoiceHash: signedInvoice.invoiceHash,
            qr: signedInvoice.qr
        };
    }


    abstract send(invoice: ZATCAInvoiceProps): Promise<any>;//type SignedInvoice
}
