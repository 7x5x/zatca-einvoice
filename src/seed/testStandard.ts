import moment from "moment";
import { DocumentCurrencyCode, ZATCAPaymentMethods } from "../types/currencyCodes.enum";
import { ZatcaCustomerInfo } from "../types/customer.interface";
import { EGSUnitInfo } from "../types/EGSUnitInfo.interface";
import { ZATCAInvoiceLineItem, ZATCAInvoiceProps, ZATCAInvoiceTypes } from "../types/invoice.interface";
const currentDate = new Date();
const futureDate = moment(currentDate).add(5, "days");

export const standardInvoices = (egsUnitInfo: EGSUnitInfo): ZATCAInvoiceProps[] => {

    const lineItems: ZATCAInvoiceLineItem[] = [
        {
            id: 1,
            name: "TEST NAME",
            notes: ["Test To Create New EGS"],
            quantity: 1,
            netUnitPrice: 100,
            VATPercent: 0.15,
        },
    ]
    const customer: ZatcaCustomerInfo = {
        NATNumber: "311111111111113",
        RegistrationName: "Acme Widget’s LTD 2",
        location: {
            Street: "الرياض",
            BuildingNumber: 1111,
            PlotIdentification: 2223,
            CitySubdivisionName: "الرياض",
            CityName: "الدمام | Dammam",
            PostalZone: 12222,
        },
    };
    const invoice: any = {
        egsInfo: egsUnitInfo,
        customer: customer,
        invoiceCounter: 1,
        invoiceSerialNumber: "OnBoarding",
        documentCurrencyCode: DocumentCurrencyCode.SAR,
        paymentMethod: ZATCAPaymentMethods.CASH,
        issueDate: moment(new Date()).format("YYYY-MM-DD"),
        deliveryDate: futureDate.format("YYYY-MM-DD"),
        issueTime: moment(new Date()).format("HH:mm:ss"),
        PIH: "",
        lineItems: lineItems,
    };
    const debitNot: ZATCAInvoiceProps = {

        ...invoice,
        cancelation: {
            canceledInvoiceNumber: 1,
            reason: "CANCELLATION_OR_TERMINATION",
            cancelationType: ZATCAInvoiceTypes.DEBIT_NOTE,
        },

    };
    const creditNote: ZATCAInvoiceProps = {

        ...invoice,
        cancelation: {
            canceledInvoiceNumber: 1,
            reason: "CANCELLATION_OR_TERMINATION",
            cancelationType: ZATCAInvoiceTypes.CREDIT_NOTE,
        },
    };

    return [invoice, debitNot, creditNote];

}
