import { DocumentCurrencyCode } from "../../types/currencyCodes.enum.js";
import { ZATCAInvoiceLineItem, ZATCAInvoiceLineItemDiscount, ZATCAInvoiceProps } from "../../types/invoice.interface.js";
import { Decimal } from "decimal.js";

// Set the rounding mode to ROUND_UP globally
Decimal.set({ rounding: Decimal.ROUND_UP });

declare global {
    interface Number {
        toFixedHalfUp: (n: number) => string;
    }
}

Number.prototype.toFixedHalfUp = function (n: number): string {
    // Ensure `n` is a valid non-negative integer
    if (!Number.isInteger(n) || n < 0) {
        throw new Error("The argument must be a non-negative integer.");
    }

    // Convert the number to a Decimal instance
    const decimalValue = new Decimal(this);

    // Add 0.5 at the (n+1)-th decimal place
    const factor = new Decimal(10).pow(n); // 10^n
    const adjustedValue = decimalValue.times(factor).plus(0.5).floor().dividedBy(factor);

    return adjustedValue.toFixed(n); // Format with `n` decimal places
};


export interface InvoiceLineCalculation {
    id: number;
    baseAmount: number;
    priceAmount: number;
    ChargeIndicator: boolean; // false = Discount | true = plus
    invoicedQuantity: number;
    lineExtensionAmount: number;
    allowanceChargeAmount: number;
    taxAmount: number;
    roundingAmount: string; // Since we use `toFixedHalfUp`, this will be a string
    notes: string[] | undefined; // Notes could be undefined if not provided
    unitCode: string,
    name: string,
}

class InvoiceCalculations {

    private static TaxExclusiveAmount = 0;
    private static AllowanceTotalAmount = 0;
    private static TaxesTotalAmount = 0;
    private static TotalPrepaidAmount = 0;//temp if needed or delete it


    public static getInvoiceLinesCalc = (lineItems: ZATCAInvoiceLineItem[]): InvoiceLineCalculation[] => {
        return lineItems.map((lineItem, i): InvoiceLineCalculation => {
            const baseAmount = lineItem.tax_exclusive_price;
            const allowanceChargeAmount = (lineItem.discount ? lineItem.discount.amount : 0);
            const priceAmount = baseAmount - allowanceChargeAmount; //BT-146 

            const invoicedQuantity = lineItem.quantity;
            const lineExtensionAmount = priceAmount * invoicedQuantity;//BT-131

            const taxAmount = lineExtensionAmount * lineItem.VAT_percent;
            const roundingAmount = (lineExtensionAmount + taxAmount).toFixedHalfUp(2);

            this.TaxExclusiveAmount += lineExtensionAmount;
            this.TaxesTotalAmount += taxAmount;
            return {
                id: i,
                baseAmount,
                priceAmount,
                ChargeIndicator: false,//false=Discount|true=pluse
                invoicedQuantity,
                lineExtensionAmount,
                allowanceChargeAmount,
                taxAmount,
                roundingAmount,
                //
                name: lineItem.name,
                notes: lineItem.notes,
                unitCode: lineItem.unitCode || "PCE",


            };
        });
    }

    public static getLegalMonetaryTotalCalc = (invoice_level_discount: number, PrepaidAmount: number) => {
        return {
            LineExtensionAmount: (this.TaxExclusiveAmount + invoice_level_discount).toFixedHalfUp(2),
            TaxExclusiveAmount: this.TaxExclusiveAmount,
            TaxInclusiveAmount: (this.TaxesTotalAmount + this.TaxExclusiveAmount).toFixedHalfUp(2),
            AllowanceTotalAmount: invoice_level_discount,
            PrepaidAmount: PrepaidAmount != null ? PrepaidAmount.toFixedHalfUp(2) : 0.0,
            PayableAmount: (this.TaxesTotalAmount + this.TaxExclusiveAmount - PrepaidAmount).toFixedHalfUp(2),
        };
    }

    public static getTaxTotalCalc = () => {
        return {
            TaxableAmount: this.TaxExclusiveAmount.toFixedHalfUp(2),
            TaxAmount: this.TaxesTotalAmount.toFixedHalfUp(2),
        };
    }

    getSARTaxTotalCalc = (taxes_total: number, CurrencyCode: DocumentCurrencyCode, conversion_rate: number) => {
        return (CurrencyCode != DocumentCurrencyCode.SAR ? taxes_total * conversion_rate : taxes_total).toFixedHalfUp(2);
    }
}

export default InvoiceCalculations;


//   private GenrateInvoiceLineXML = (lineItem: InvoiceLineCalculation, CurrencyCode) => {
//     return {
//         line_item_xml: {
//             "cbc:ID": lineItem.id,

//             "cbc:Note": lineItem.notes,
//             "cbc:InvoicedQuantity": {
//                 "@_unitCode": lineItem.unitCode,
//                 "#text": lineItem.invoicedQuantity,
//             },
//             // BR-DEC-23
//             "cbc:LineExtensionAmount": {
//                 "@_currencyID": CurrencyCode,
//                 "#text": lineItem.lineExtensionAmount,
//             },
//             "cac:AllowanceCharge": cacAllowanceCharges,
//             "cac:TaxTotal": cacTaxTotal,
//             "cac:Item": {
//                 "cbc:Name": lineItem.name,
//                 "cac:ClassifiedTaxCategory": cacClassifiedTaxCategories,
//             },
//             "cac:Price": {
//                 "cbc:PriceAmount": {
//                     "@_currencyID": CurrencyCode,
//                     "#text": lineItem.taxAmount,
//                 },
//             },
//         },
//     }


// }