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
    percentAmount: number;
}

export interface ZATCAInvoiceLineItem {
    id: number;
    name: string;
    notes?: string[];
    quantity: number;
    netUnitPrice: number;
    unitCode?: string;
    discount?: ZATCAInvoiceLineItemDiscount;
    VATPercent?: number;
}

export interface ZATCAInvoicCancelation {
    canceledInvoiceNumber: number;
    cancelationType: ZATCAInvoiceTypes;
    reason: string;
}

export interface ZATCAInvoiceProps {
    uuid?: string;
    egsInfo: EGSUnitInfo;
    documentCurrencyCode: DocumentCurrencyCode;
    conversionRate?: number;
    paymentMethod: ZATCAPaymentMethods;
    customerInfo?: ZatcaCustomerInfo;
    invoiceCounter: number;
    PrepaidAmount?: number;
    invoiceSerialNumber: string;
    issueDate: string;
    deliveryDate: string;
    issueTime: string;
    invoiceLevelNote?: string;
    invoice_level_discount?: ZATCAInvoiceLineItemDiscount;
    PIH: string;
    lineItems?: ZATCAInvoiceLineItem[];
    cancelation?: ZATCAInvoicCancelation;
}
