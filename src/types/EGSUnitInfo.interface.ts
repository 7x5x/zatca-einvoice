import { IInvoiceType } from "../zatca/signing/generateCSR";

export interface EGSUnitLocation {
    city: string;
    citySubdivision: string;
    street: string;
    plotIdentification: number;
    building: number;
    postalZone: number;
}

export interface EGSUnitInfo {
    commonName: string;//taxpayer_provided_id | custom_id
    organizationIdentifier: string;//VAT_number
    organizationName: string;//taxpayer_name |VAT_name  
    organizationUnit: string;//branch_name
    country: string;
    invoiceType: IInvoiceType;
    CRNNumber?: string;
    location: EGSUnitLocation;
    businessCategory: string;//branch_industry
    egsSolutionName: string;
    egsModel: string;//egs_model
    egsSerialNumber: string;
}