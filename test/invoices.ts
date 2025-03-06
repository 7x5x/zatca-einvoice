import moment from "moment";
import { DocumentCurrencyCode, ZATCAPaymentMethods } from "../src/types/currencyCodes.enum";
import { ZatcaCustomerInfo } from "../src/types/customer.interface";
import { ZATCATaxInvoice } from "../src/zatca/xmlGenerator/ZATCATaxInvoice";

const currentDate = new Date();
const futureDate = moment(currentDate).add(5, "days");


export const invoice: any = {
    invoiceCounter: 1,
    invoiceSerialNumber: "EGS1-886431145-1",
    documentCurrencyCode: DocumentCurrencyCode.SAR,
    paymentMethod: ZATCAPaymentMethods.CASH,
    issueDate: moment(new Date()).format("YYYY-MM-DD"),
    deliveryDate: futureDate.format("YYYY-MM-DD"),
    issueTime: moment(new Date()).format("HH:mm:ss"),
    PIH:
        "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==",
    lineItems: [
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

export const customer: ZatcaCustomerInfo = {
    NATNumber: "311111111111113",
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


export const TempInvoice = new ZATCATaxInvoice({
    props: {
        customerInfo: customer,
        egsInfo: customer,
        ...invoice,
    },
});