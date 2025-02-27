export interface EGSUnitLocation {
    city: string;
    city_subdivision: string;
    street: string;
    plot_identification: number;
    building: number;
    postal_zone: number;
}

export interface EGSUnitInfo {
    uuid: string;
    custom_id: string;
    model: string;
    CRN_number: string;
    VAT_name: string;
    VAT_number: string;
    branch_name: string;
    branch_industry: string;
    location: EGSUnitLocation;
    private_key?: string;
    csr?: string;
    compliance_certificate?: string;
    compliance_api_secret?: string;
    production_certificate?: string;
    production_api_secret?: string;
}

