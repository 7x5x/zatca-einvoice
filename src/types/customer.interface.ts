export interface ZatcaCustomerInfo {
    NAT_number: string;
    location: CustomerLocation;
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

