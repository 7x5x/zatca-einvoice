// src/invoice/IInvoiceSender.ts
// import { Invoice, SignedInvoice } from '../types';

import { ZATCAInvoiceProps } from "../zatca/templates/ZATCATaxInvoice";

export interface IInvoiceSender {
    send(invoice: ZATCAInvoiceProps): Promise<any>;
}