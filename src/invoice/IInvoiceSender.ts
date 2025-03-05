// src/invoice/IInvoiceSender.ts
// import { Invoice, SignedInvoice } from '../types';

import { ZATCAInvoiceProps } from "../types/invoice.interface";

 

export interface IInvoiceSender {
    send(invoice: ZATCAInvoiceProps): Promise<any>;
}