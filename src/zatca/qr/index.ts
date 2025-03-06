import moment from "moment";

import { XMLDocument } from "../../utils/index.js";
import { getInvoiceHash } from "../signing/index.js";

interface QRParams {
  invoice_xml: XMLDocument;
  digital_signature: string;
  public_key: Buffer;
  certificate_signature: Buffer;
}

/**
 * Generates QR for a given invoice. According to ZATCA BR-KSA-27
 * @param invoice_xml XMLDocument.
 * @param digital_signature String base64 encoded digital signature.
 * @param public_key Buffer certificate public key.
 * @param certificate_signature Buffer certificate signature.
 * @returns String base64 encoded QR data.
 */
export const generateQR = ({
  invoice_xml,
  digital_signature,
  public_key,
  certificate_signature,
}: QRParams): string => {
  // Hash

  const invoiceHash: string = getInvoiceHash(invoice_xml);

  // Extract required tags
  const seller_name = invoice_xml.get(
    "Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyLegalEntity/cbc:RegistrationName"
  )?.[0];

  const VAT_number = invoice_xml
    .get(
      "Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyTaxScheme/cbc:CompanyID"
    )?.[0]
    .toString();

  const invoice_total = invoice_xml
    .get("Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount")?.[0]
  ["#text"].toString();

  const DOC_Currency_VAT_total = invoice_xml.get("Invoice/cac:TaxTotal")?.[0][
    "cbc:TaxAmount"
  ]["#text"];

  const SAR_VAT_total = invoice_xml.get("Invoice/cac:TaxTotal")?.[1][
    "cbc:TaxAmount"
  ]["#text"];

  const conversionRate = SAR_VAT_total / DOC_Currency_VAT_total;
  const total = (invoice_total * conversionRate).toFixedHalfUp(2).toString();

  const issueDate = invoice_xml.get("Invoice/cbc:IssueDate")?.[0];
  const issueTime = invoice_xml.get("Invoice/cbc:IssueTime")?.[0];

  // Detect if  invoice or not (not used currently assuming all simplified tax invoice)
  const invoice_type = invoice_xml
    .get("Invoice/cbc:InvoiceTypeCode")?.[0]
  ["@_name"].toString();

  const datetime = `${issueDate} ${issueTime}`;
  const formatted_datetime =
    moment(datetime, "YYYY-MM-DD HH:mm:ss").toISOString();

  const qr_tlv = TLV([
    seller_name,
    VAT_number,
    formatted_datetime,
    total,
    SAR_VAT_total.toString(),
    invoiceHash,
    Buffer.from(digital_signature),
    public_key,
    certificate_signature,
  ]);

  return qr_tlv.toString("base64");
};


const TLV = (tags: any[]): Buffer => {
  const tlv_tags: Buffer[] = [];
  tags.forEach((tag, i) => {
    const tagValueBuffer: Buffer = Buffer.from(tag);
    const current_tlv_value: Buffer = Buffer.from([
      i + 1,
      tagValueBuffer.byteLength,
      ...tagValueBuffer,
    ]);
    tlv_tags.push(current_tlv_value);
  });
  return Buffer.concat(tlv_tags);
};

