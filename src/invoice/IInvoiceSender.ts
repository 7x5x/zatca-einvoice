// src/invoice/IInvoiceSender.ts
// import { Invoice, SignedInvoice } from '../types';

import { ZATCATaxInvoice } from "../zatca/templates/ZATCATaxInvoice";

export interface IInvoiceSender {
    send(uuid: string, invoiceHash: string, invoice: ZATCATaxInvoice): Promise<any>;
}