import { DocumentCurrencyCode, ZATCAPaymentMethods } from "./currencyCodes.enum";
import { ZatcaCustomerInfo } from "./customer.interface";
import { EGSUnitInfo } from "./EGSUnitInfo.interface";

export enum ZATCAInvoiceTypes {
    INVOICE = "388",
    DEBIT_NOTE = "383",
    CREDIT_NOTE = "381",
}


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

export interface ZATCAInvoiceProps {
    uuid?: string;
    egs_info?: EGSUnitInfo;
    documentCurrencyCode: DocumentCurrencyCode;
    conversion_rate?: number;
    payment_method: ZATCAPaymentMethods;
    customerInfo: ZatcaCustomerInfo;
    invoice_counter_number: number;
    PrepaidAmount?: number;
    invoice_serial_number: string;
    issue_date: string;
    delivery_date: string;
    issue_time: string;
    invoice_level_note?: string;
    invoice_level_discount?: ZATCAInvoiceLineItemDiscount;
    previous_invoice_hash: string;
    line_items?: ZATCAInvoiceLineItem[];
    cancelation?: ZATCAInvoicCancelation;
}
