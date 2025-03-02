import moment from "moment";
import { DocumentCurrencyCode, ZATCAPaymentMethods } from "../src/types/currencyCodes.enum"; 
import { ZatcaCustomerInfo } from "../src/types/customer.interface";
import { ZATCATaxInvoice } from "../src/zatca/templates/ZATCATaxInvoice";

const currentDate = new Date();
const futureDate = moment(currentDate).add(5, "days");


export const invoice: any = {
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

export const customer: ZatcaCustomerInfo = {
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

 
export const TempInvoice = new ZATCATaxInvoice({
    props: {
        customerInfo: customer,
        egs_info: customer,
        ...invoice,
    },
});