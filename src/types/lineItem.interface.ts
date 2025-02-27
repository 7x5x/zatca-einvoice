import { ZATCAInvoiceTypes } from "./invoiceTypes.enum";

export interface ZATCAInvoiceLineItemDiscount {
    amount: number;
    reason: string;
}

export interface ZATCAInvoiceLineItemTax {
    percent_amount: number;
}

export interface ZATCAInvoiceLineItem {
    id: number;
    name: string;
    notes?: string[];
    quantity: number;
    penalty?: ZATCAInvoiceLineItemDiscount;
    tax_exclusive_price: number;
    unitCode?: string;
    discount?: ZATCAInvoiceLineItemDiscount;
    VAT_percent?: number;
}

export interface ZATCAInvoicCancelation {
    canceled_invoice_number: number;
    cancelation_type: ZATCAInvoiceTypes;
    reason: string;
}
