import { IInvoiceType } from "../zatca/signing/generateCSR";

export interface EGSUnitLocation {
    city: string;
    city_subdivision: string;
    street: string;
    plot_identification: number;
    building: number;
    postal_zone: number;
}



export interface EGSUnitInfo {
    uuid?: string;
    commonName: string;//taxpayer_provided_id | custom_id
    organizationIdentifier: string;//VAT_number
    organizationName: string;//taxpayer_name |VAT_name  
    organizationUnit: string;//branch_name
    country: string;
    invoiceType: IInvoiceType;
    CRN_number?: string;
    location: EGSUnitLocation;
    businessCategory: string;//branch_industry
    egsSolutionName: string;
    egsModel: string;//egs_model
    egsSerialNumber: string;
}