import { XMLDocument } from "../../parser/index.js";
import { generateSignedXMLString } from "../signing/index.js";
import defaultSimplifiedTaxInvoice, {
  ZATCAInvoiceLineItem as ZATCAInvoiceLineItem,
  ZATCAInvoiceProps,
  ZATCAInvoiceTypes,
  ZATCAPaymentMethods,
  DocumentCurrencyCode,
  ZATCAInvoiceLineItemDiscount,
} from "./tax_invoice_template.js";

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


export {
  ZATCAInvoiceLineItem,
  ZATCAInvoiceProps,
  ZATCAInvoiceTypes,
  ZATCAPaymentMethods,
};
export class ZATCATaxInvoice {
  private invoice_xml: XMLDocument;

  /**
   * Parses a ZATCA  Tax Invoice XML string. Or creates a new one based on given props.*/
  constructor({
    invoice_xml_str,
    props,
  }: {
    invoice_xml_str?: string;
    props?: ZATCAInvoiceProps;
  }) {
    if (invoice_xml_str) {
      this.invoice_xml = new XMLDocument(invoice_xml_str);
      if (!this.invoice_xml)
        throw new Error("Error parsing invoice XML string.");
    } else {
      if (!props) throw new Error("Unable to create new XML invoice.");
      this.invoice_xml = new XMLDocument(defaultSimplifiedTaxInvoice(props));

      // Parsing
      this.parseLineItems(props.line_items ?? [], props);
    }
  }

  private constructLineItemTotals = (
    line_item: ZATCAInvoiceLineItem,
    CurrencyCode: DocumentCurrencyCode
  ) => {
    let line_item_discount = 0;
    let line_item_total_taxes = 0;
    let cacAllowanceCharges: any[] = [];
    let cacClassifiedTaxCategories: any[] = [];
    let cacTaxTotal = {};

    const VAT = {
      "cbc:ID": line_item.VAT_percent ? "S" : "O",
      "cbc:Percent": line_item.VAT_percent
        ? (line_item.VAT_percent * 100).toFixedHalfUp(2)
        : undefined,
      "cac:TaxScheme": {
        "cbc:ID": "VAT",
      },
    };
    cacClassifiedTaxCategories.push(VAT);

    line_item_discount =
      (line_item.discount ? line_item.discount.amount : 0) +
      (line_item.penalty ? line_item.penalty.amount : 0);
    // Calc total discount

    if (line_item.discount || line_item.penalty) {
      cacAllowanceCharges.push({
        "cbc:ChargeIndicator": "false",
        "cbc:AllowanceChargeReason": line_item.penalty
          ? `${line_item.penalty.amount}  ${line_item.penalty.reason}`
          : line_item.discount.reason,
        "cbc:Amount": {
          "@_currencyID": CurrencyCode,
          // BR-DEC-01
          "#text": line_item_discount.toFixedHalfUp(2),
        },
      });
    }

    let line_item_subtotal =
      (line_item.tax_exclusive_price -
        line_item_discount / line_item.quantity) *
      line_item.quantity;

    // Calc total taxes
    // BR-KSA-DEC-02

    line_item_total_taxes =
      line_item_total_taxes +
      (line_item_subtotal + (line_item.penalty?.amount || 0)) *
      line_item.VAT_percent;

    // BR-KSA-DEC-03, BR-KSA-51
    cacTaxTotal = {
      "cbc:TaxAmount": {
        "@_currencyID": CurrencyCode,
        "#text": line_item_total_taxes.toFixedHalfUp(2),
      },
      "cbc:RoundingAmount": {
        "@_currencyID": CurrencyCode,
        "#text": (
          parseFloat(line_item_subtotal.toFixedHalfUp(2)) +
          parseFloat(line_item_total_taxes.toFixedHalfUp(2))
        ).toFixed(2),
      },
    };

    return {
      cacAllowanceCharges,
      cacClassifiedTaxCategories,
      cacTaxTotal,
      line_item_total_tax_exclusive: line_item_subtotal,
      line_item_total_taxes,
      line_item_discount,
    };
  };

  private constructLineItem = (
    line_item: ZATCAInvoiceLineItem,
    CurrencyCode: DocumentCurrencyCode
  ) => {
    const {
      cacAllowanceCharges,
      cacClassifiedTaxCategories,
      cacTaxTotal,
      line_item_total_tax_exclusive,
      line_item_total_taxes,
      line_item_discount,
    } = this.constructLineItemTotals(line_item, CurrencyCode);

    return {
      line_item_xml: {
        "cbc:ID": line_item.id,

        "cbc:Note": line_item.notes,
        "cbc:InvoicedQuantity": {
          "@_unitCode": line_item.unitCode ?? "PCE",
          "#text": line_item.quantity,
        },
        // BR-DEC-23
        "cbc:LineExtensionAmount": {
          "@_currencyID": CurrencyCode,
          "#text": line_item_total_tax_exclusive.toFixedHalfUp(2),
        },
        "cac:AllowanceCharge": cacAllowanceCharges,
        "cac:TaxTotal": cacTaxTotal,
        "cac:Item": {
          "cbc:Name": line_item.name,
          "cac:ClassifiedTaxCategory": cacClassifiedTaxCategories,
        },
        "cac:Price": {
          "cbc:PriceAmount": {
            "@_currencyID": CurrencyCode,
            "#text": line_item.tax_exclusive_price,
          },
        },
      },
      line_item_totals: {
        taxes_total: line_item_total_taxes,
        discounts_total: line_item_discount,
        subtotal: line_item_total_tax_exclusive,
      },
    };
  };

  private constructLegalMonetaryTotal = (
    tax_exclusive_subtotal: number,
    taxes_total: number,
    invoice_level_discount: number,
    PrepaidAmount: number,
    CurrencyCode: DocumentCurrencyCode
  ) => {
    return {
      // BR-DEC-09    total invoice LineItem befor VAT or discount
      "cbc:LineExtensionAmount": {
        "@_currencyID": CurrencyCode,
        "#text": (
          tax_exclusive_subtotal + invoice_level_discount
        ).toFixedHalfUp(2),
      },
      //BR-DEC-12 total invoice LineItem with  discount befor VAT
      "cbc:TaxExclusiveAmount": {
        "@_currencyID": CurrencyCode,
        "#text": tax_exclusive_subtotal.toFixedHalfUp(2),
      },
      // BR-DEC-14, BT-112 final price the customer needs to pay(base price and the applicable VAT),
      "cbc:TaxInclusiveAmount": {
        "@_currencyID": CurrencyCode,
        "#text": (
          parseFloat(tax_exclusive_subtotal.toFixedHalfUp(2)) +
          parseFloat(taxes_total.toFixedHalfUp(2))
        ).toFixed(2),
      },
      "cbc:AllowanceTotalAmount": {
        "@_currencyID": CurrencyCode,
        "#text": invoice_level_discount,
      },
      "cbc:PrepaidAmount": {
        "@_currencyID": CurrencyCode,
        "#text": PrepaidAmount != null ? PrepaidAmount.toFixedHalfUp(2) : 0.0,
      },
      // BR-DEC-18, BT-112
      "cbc:PayableAmount": {
        "@_currencyID": CurrencyCode,
        "#text": (
          parseFloat(tax_exclusive_subtotal.toFixedHalfUp(2)) +
          parseFloat(taxes_total.toFixedHalfUp(2))
        ).toFixed(2),
      },
    };
  };

  private constructTaxTotal = (
    line_items: ZATCAInvoiceLineItem[],
    CurrencyCode: DocumentCurrencyCode,
    conversion_rate: number,
    invoice_level_discount: number
  ) => {
    const cacTaxSubtotal: any[] = [];
    const addTaxSubtotal = (
      taxable_amount: number,
      tax_amount: number,
      tax_percent: number
    ) => {
      cacTaxSubtotal.push({
        // BR-DEC-19
        "cbc:TaxableAmount": {
          "@_currencyID": CurrencyCode,
          "#text": taxable_amount.toFixedHalfUp(2),
        },
        "cbc:TaxAmount": {
          "@_currencyID": CurrencyCode,
          "#text": tax_amount.toFixedHalfUp(2),
        },
        "cac:TaxCategory": {
          "cbc:ID": {
            "@_schemeAgencyID": 6,
            "@_schemeID": "UN/ECE 5305",
            "#text": tax_percent ? "S" : "O",
          },
          "cbc:Percent": (tax_percent * 100).toFixedHalfUp(2),
          // BR-O-10
          "cbc:TaxExemptionReason": tax_percent
            ? undefined
            : "Not subject to VAT",
          "cac:TaxScheme": {
            "cbc:ID": {
              "@_schemeAgencyID": "6",
              "@_schemeID": "UN/ECE 5153",
              "#text": "VAT",
            },
          },
        },
      });
    };

    let taxes_total = 0;
    let taxable_amount = 0;
    line_items.map((line_item) => {
      const total_line_item_discount = line_item.discount
        ? line_item.discount.amount
        : 0;
      const item_taxable_amount =
        line_item.tax_exclusive_price * line_item.quantity -
        total_line_item_discount -
        invoice_level_discount / line_items.length;
      taxable_amount += item_taxable_amount;

      let tax_amount = line_item.VAT_percent * item_taxable_amount;

      taxes_total += tax_amount;
    });

    addTaxSubtotal(taxable_amount, taxes_total, line_items[0].VAT_percent);

    return [
      {
        "cbc:TaxAmount": {
          "@_currencyID": CurrencyCode,
          "#text": taxes_total.toFixedHalfUp(2),
        },
        "cac:TaxSubtotal": cacTaxSubtotal,
      },
      {
        // TaxAmount must be SAR even if the invoice is USD
        "cbc:TaxAmount": {
          "@_currencyID": "SAR",
          "#text": (CurrencyCode != DocumentCurrencyCode.SAR
            ? taxes_total * conversion_rate
            : taxes_total
          ).toFixedHalfUp(2),
        },
      },
    ];
  };

  private constructAllowanceCharge = (
    discount: ZATCAInvoiceLineItemDiscount,
    CurrencyCode: DocumentCurrencyCode,
    VAT_percent: number
  ) => {
    const cacTaxCategory: any = {
      "cbc:ChargeIndicator": {
        "#text": "false",
      },
      "cbc:AllowanceChargeReason": {
        "#text": discount.reason,
      },
      "cbc:Amount": {
        "@_currencyID": CurrencyCode,
        "#text": discount.amount,
      },
      "cac:TaxCategory": {
        "cbc:ID": {
          "@_schemeAgencyID": 6,
          "@_schemeID": "UN/ECE 5305",
          "#text": true ? "S" : "O",
        },
        "cbc:Percent": (VAT_percent * 100).toFixedHalfUp(2),
        "cac:TaxScheme": {
          "cbc:ID": {
            "@_schemeAgencyID": "6",
            "@_schemeID": "UN/ECE 5153",
            "#text": "VAT",
          },
        },
        // BR-O-10
      },
    };

    return cacTaxCategory;
  };

  private parseLineItems(
    line_items: ZATCAInvoiceLineItem[],
    props: ZATCAInvoiceProps
  ) {
    let total_taxes: number = 0;
    let total_subtotal: number = 0;
    let invoice_line_items: any[] = [];

    line_items.map((line_item) => {
      const { line_item_xml, line_item_totals } = this.constructLineItem(
        line_item,
        props.documentCurrencyCode
      );

      total_taxes += line_item_totals.taxes_total;

      total_subtotal += line_item_totals.subtotal;

      invoice_line_items.push(line_item_xml);
    });

    // BT-110
    props.invoice_level_discount
      ? (total_taxes =
        total_taxes -
        props.invoice_level_discount.amount * line_items[0].VAT_percent)
      : total_taxes;

    total_subtotal = props.invoice_level_discount
      ? total_subtotal - props.invoice_level_discount.amount
      : total_subtotal;

    this.invoice_xml.set("Invoice/cac:Delivery", false, {
      "cbc:ActualDeliveryDate": props.delivery_date,
    });

    if (props.cancelation) {
      // Invoice canceled. Turned into credit/debit note. Must have PaymentMeans
      this.invoice_xml.set("Invoice/cac:PaymentMeans", false, {
        "cbc:PaymentMeansCode": props.payment_method,
        "cbc:InstructionNote": props.cancelation.reason ?? "No note Specified",
      });
    } else {
      this.invoice_xml.set("Invoice/cac:PaymentMeans", false, {
        "cbc:PaymentMeansCode": props.payment_method,
      });
    }

    props.invoice_level_discount &&
      this.invoice_xml.set(
        "Invoice/cac:AllowanceCharge",
        false,
        this.constructAllowanceCharge(
          props.invoice_level_discount,
          props.documentCurrencyCode,
          line_items[0].VAT_percent
        )
      );

    this.invoice_xml.set(
      "Invoice/cac:TaxTotal",
      false,
      this.constructTaxTotal(
        line_items,
        props.documentCurrencyCode,
        props.conversion_rate,
        props.invoice_level_discount ? props.invoice_level_discount.amount : 0
      )
    );

    this.invoice_xml.set(
      "Invoice/cac:LegalMonetaryTotal",
      true,
      this.constructLegalMonetaryTotal(
        total_subtotal,
        total_taxes,
        props.invoice_level_discount ? props.invoice_level_discount.amount : 0,
        props.PrepaidAmount,
        props.documentCurrencyCode
      )
    );

    invoice_line_items.map((line_item) => {
      this.invoice_xml.set("Invoice/cac:InvoiceLine", false, line_item);
    });
  }

  getXML(): XMLDocument {
    return this.invoice_xml;
  }

  /**
   * Signs the invoice.*/

  sign(certificate_string: string, private_key_string: string) {
    return generateSignedXMLString({
      invoice_xml: this.invoice_xml,
      certificate_string: certificate_string,
      private_key_string: private_key_string,
    });
  }
}
