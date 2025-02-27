import { EGSUnitInfo } from "../../types/EGSUnitInfo.interface.js";
import BillingReferenceTag from "./invoice_billing_reference_template.js";

/**
 * Maybe use a templating engine instead of str replace.
 * This works for now though
 *
 * cbc:InvoiceTypeCode: 388: BR-KSA-05 Tax Invoice according to UN/CEFACT codelist 1001, D.16B for KSA.
 *  name="0211010": BR-KSA-06 starts with "02" Simplified Tax Invoice. Also explains other positions.
 * cac:AdditionalDocumentReference: ICV: KSA-16, BR-KSA-33 (Invoice Counter number)
 */
const template = /* XML */ `
<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"><ext:UBLExtensions>SET_UBL_EXTENSIONS_STRING</ext:UBLExtensions>
    
    <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
    <cbc:ID>SET_INVOICE_SERIAL_NUMBER</cbc:ID>
    <cbc:UUID>SET_TERMINAL_UUID</cbc:UUID>
    <cbc:IssueDate>SET_ISSUE_DATE</cbc:IssueDate>
    <cbc:IssueTime>SET_ISSUE_TIME</cbc:IssueTime>
    <cbc:InvoiceTypeCode name="0100000">SET_INVOICE_TYPE</cbc:InvoiceTypeCode>
    SET_INVOICE_LEVEL_NOTE
    <cbc:DocumentCurrencyCode>SET_DOCUMENT_CURRENCT_CODE</cbc:DocumentCurrencyCode>
    <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
    SET_BILLING_REFERENCE
    <cac:AdditionalDocumentReference>
        <cbc:ID>ICV</cbc:ID>
        <cbc:UUID>SET_INVOICE_COUNTER_NUMBER</cbc:UUID>
    </cac:AdditionalDocumentReference>
    <cac:AdditionalDocumentReference>
        <cbc:ID>PIH</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">SET_PREVIOUS_INVOICE_HASH</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>
    <cac:AdditionalDocumentReference>
        <cbc:ID>QR</cbc:ID>
        <cac:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">SET_QR_CODE_DATA</cbc:EmbeddedDocumentBinaryObject>
        </cac:Attachment>
    </cac:AdditionalDocumentReference>
    <cac:Signature>
        <cbc:ID>urn:oasis:names:specification:ubl:signature:Invoice</cbc:ID>
        <cbc:SignatureMethod>urn:oasis:names:specification:ubl:dsig:enveloped:xades</cbc:SignatureMethod>
    </cac:Signature>
    <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">SET_COMMERCIAL_REGISTRATION_NUMBER</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>SET_STREET_NAME</cbc:StreetName>
        <cbc:BuildingNumber>SET_BUILDING_NUMBER</cbc:BuildingNumber>
        <cbc:PlotIdentification>SET_PLOT_IDENTIFICATION</cbc:PlotIdentification>
        <cbc:CitySubdivisionName>SET_CITY_SUBDIVISION</cbc:CitySubdivisionName>
        <cbc:CityName>SET_CITY</cbc:CityName>
        <cbc:PostalZone>SET_POSTAL_NUMBER</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>SET_VAT_NUMBER</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>SET_VAT_NAME</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty> <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="SET_CUSTOMER_NAT_OR_CRN">SET_CUSTOMER_COMMERCIAL_REGISTRATION_NUMBER</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>SET_CUSTOMER_STREET_NAME</cbc:StreetName>
        <cbc:BuildingNumber>SET_CUSTOMER_BUILDING_NUMBER</cbc:BuildingNumber>
        <cbc:PlotIdentification>SET_CUSTOMER_PLOT_IDENTIFICATION</cbc:PlotIdentification>
        <cbc:CitySubdivisionName>SET_CUSTOMER_CITY_SUBDIVISION</cbc:CitySubdivisionName>
        <cbc:CityName>SET_CUSTOMER_CITY</cbc:CityName>
        <cbc:PostalZone>SET_CUSTOMER_POSTAL_NUMBER</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>SA</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>SET_CUSTOMER_VAT_NAME</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party></cac:AccountingCustomerParty>


</Invoice>
`;

// 11.2.5 Payment means type code
export enum ZATCAPaymentMethods {
  CASH = "10",
  CREDIT = "30",
  BANK_ACCOUNT = "42",
  BANK_CARD = "48",
}

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
  penalty?: ZATCAInvoiceLineItemDiscount;
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
export interface ZatcaCustomerInfo {
  NAT_number: string;
  location: CustomerLocation;
  // PartyTaxScheme: string;
  RegistrationName: string;
}

export interface CustomerLocation {
  Street: string;
  BuildingNumber: number;
  PlotIdentification: number;
  CitySubdivisionName: string;
  CityName: string;
  PostalZone: number;
}
export enum DocumentCurrencyCode {
  SAR = "SAR",
  USD = "USD",
  EUR = "EUR",
  AED = "AED",
  BHD = "BHD",
}
export interface productionCSID {
  issued_certificate: string;
  api_secret: string;
  request_id: string;
}
export interface productionData {
  private_key: string;
  production_certificate: string;
  production_api_secret: string;
  request_id?: string;
}

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

export default function populate(props: ZATCAInvoiceProps): string {
  let populated_template = template;

  populated_template = populated_template.replace(
    "SET_INVOICE_TYPE",
    props.cancelation
      ? props.cancelation.cancelation_type
      : ZATCAInvoiceTypes.INVOICE
  );
  populated_template = populated_template.replace(
    "SET_INVOICE_LEVEL_NOTE",
    props.invoice_level_note != null
      ? `<cbc:Note>${props.invoice_level_note}</cbc:Note>`
      : ""
  );
  populated_template = populated_template.replace(
    "SET_DOCUMENT_CURRENCT_CODE",
    props.documentCurrencyCode
  );
  // if canceled (BR-KSA-56) set reference number to canceled invoice
  if (props.cancelation) {
    populated_template = populated_template.replace(
      "SET_BILLING_REFERENCE",
      BillingReferenceTag(props.cancelation.canceled_invoice_number)
    );
  } else {
    populated_template = populated_template.replace(
      "SET_BILLING_REFERENCE",
      ""
    );
  }

  populated_template = populated_template.replace(
    "SET_INVOICE_SERIAL_NUMBER",
    props.invoice_serial_number
  );
  populated_template = populated_template.replace(
    "SET_TERMINAL_UUID",
    props.egs_info.uuid
  );
  populated_template = populated_template.replace(
    "SET_ISSUE_DATE",
    props.issue_date
  );
  populated_template = populated_template.replace(
    "SET_ISSUE_TIME",
    props.issue_time
  );
  populated_template = populated_template.replace(
    "SET_PREVIOUS_INVOICE_HASH",
    props.previous_invoice_hash
  );
  populated_template = populated_template.replace(
    "SET_INVOICE_COUNTER_NUMBER",
    props.invoice_counter_number.toString()
  );
  populated_template = populated_template.replace(
    "SET_COMMERCIAL_REGISTRATION_NUMBER",
    props.egs_info.CRN_number
  );

  populated_template = populated_template.replace(
    "SET_STREET_NAME",
    props.egs_info.location.street
  );
  populated_template = populated_template.replace(
    "SET_BUILDING_NUMBER",
    props.egs_info.location.building.toString()
  );
  populated_template = populated_template.replace(
    "SET_PLOT_IDENTIFICATION",
    props.egs_info.location.plot_identification.toString()
  );
  populated_template = populated_template.replace(
    "SET_CITY_SUBDIVISION",
    props.egs_info.location.city_subdivision
  );
  populated_template = populated_template.replace(
    "SET_CITY",
    props.egs_info.location.city
  );
  populated_template = populated_template.replace(
    "SET_POSTAL_NUMBER",
    props.egs_info.location.postal_zone.toString()
  );

  populated_template = populated_template.replace(
    "SET_VAT_NUMBER",
    props.egs_info.VAT_number
  );
  populated_template = populated_template.replace(
    "SET_VAT_NAME",
    props.egs_info.VAT_name
  );

  populated_template = populated_template.replace(
    "SET_CUSTOMER_COMMERCIAL_REGISTRATION_NUMBER",
    props.customerInfo.NAT_number
  );
  populated_template = populated_template.replace(
    "SET_CUSTOMER_NAT_OR_CRN",
    props.cancelation ? "CRN" : "NAT"
  );

  populated_template = populated_template.replace(
    "SET_CUSTOMER_STREET_NAME",
    props.customerInfo.location.Street
  );
  populated_template = populated_template.replace(
    "SET_CUSTOMER_BUILDING_NUMBER",
    props.customerInfo.location.BuildingNumber.toString()
  );
  populated_template = populated_template.replace(
    "SET_CUSTOMER_PLOT_IDENTIFICATION",
    props.customerInfo.location.PlotIdentification.toString()
  );
  populated_template = populated_template.replace(
    "SET_CUSTOMER_CITY_SUBDIVISION",
    props.customerInfo.location.CitySubdivisionName
  );
  populated_template = populated_template.replace(
    "SET_CUSTOMER_CITY",
    props.customerInfo.location.CityName
  );
  populated_template = populated_template.replace(
    "SET_CUSTOMER_POSTAL_NUMBER",
    props.customerInfo.location.PostalZone.toString()
  );
  populated_template = populated_template.replace(
    "SET_CUSTOMER_VAT_NAME",
    props.customerInfo.RegistrationName
  );

  return populated_template;
}
