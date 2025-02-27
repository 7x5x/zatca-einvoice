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
