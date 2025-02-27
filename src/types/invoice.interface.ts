import { DocumentCurrencyCode } from "./currencyCodes.enum";
import {  ZatcaCustomerInfo } from "./customer.interface"; 
import { EGSUnitInfo } from "./EGSUnitInfo.interface";
import { ZATCAInvoiceLineItemDiscount, ZATCAInvoiceLineItem, ZATCAInvoicCancelation } from "./lineItem.interface";
import { ZATCAPaymentMethods } from "./paymentMethods.enum";

 

export interface ZATCAInvoiceProps {
    egs_info: EGSUnitInfo;
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
