import moment from "moment";
import { DocumentCurrencyCode } from "../types/currencyCodes.enum";
import { ZatcaCustomerInfo } from "../types/customer.interface";
import { ZATCAPaymentMethods } from "../types/paymentMethods.enum";
import { ZATCAInvoiceTypes } from "../types/invoiceTypes.enum";
import { ZATCATaxInvoice } from "../zatca/templates/ZATCATaxInvoice";
import { EGSUnitInfo } from "../types/EGSUnitInfo.interface";
const currentDate = new Date();
const futureDate = moment(currentDate).add(5, "days");

export const simplifiedInvoices = (egsUnitInfo: EGSUnitInfo) => {
    const tempInvoice: any = {
        invoice_counter_number: 1,
        invoice_serial_number: "EGS1-886431145-1",
        documentCurrencyCode: DocumentCurrencyCode.SAR,
        payment_method: ZATCAPaymentMethods.CASH,
        issue_date: moment(new Date()).format("YYYY-MM-DD"),
        delivery_date: futureDate.format("YYYY-MM-DD"),
        issue_time: moment(new Date()).format("HH:mm:ss"),
        previous_invoice_hash:
            "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
        line_items: [
            {
                id: 1,
                name: "TEST NAME",
                note: "Test To Create New EGS",
                quantity: 1,
                tax_exclusive_price: 1000,
                VAT_percent: 0.15,
            },
        ],
    };

    const customer: ZatcaCustomerInfo = {
        NAT_number: "311111111111113",
        // PartyTaxScheme: "strings11111111111",
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


    const invoice = new ZATCATaxInvoice({
        props: {
            customerInfo: customer,
            egs_info: egsUnitInfo,
            ...tempInvoice,
        },
    });
    const debit_not = new ZATCATaxInvoice({
        props: {
            customerInfo: customer,
            egs_info: egsUnitInfo,
            ...tempInvoice,
            cancelation: {
                canceled_invoice_number: 1,
                reason: "CANCELLATION_OR_TERMINATION",
                cancelation_type: ZATCAInvoiceTypes.DEBIT_NOTE,
            },
        },
    });
    const credit_note = new ZATCATaxInvoice({
        props: {
            customerInfo: customer,
            egs_info: egsUnitInfo,
            ...tempInvoice,
            cancelation: {
                canceled_invoice_number: 1,
                reason: "CANCELLATION_OR_TERMINATION",
                cancelation_type: ZATCAInvoiceTypes.CREDIT_NOTE,
            },
        },
    });

    return [invoice, debit_not, credit_note];

}
