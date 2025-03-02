export enum ZatcaEnvironmentUrl {
    Production = "https://gw-fatoora.zatca.gov.sa/e-invoicing/core",
    Sandbox = "https://gw-apic-gov.gazt.gov.sa/e-invoicing/developer-portal",
    Simulation = "https://gw-fatoora.zatca.gov.sa/e-invoicing/simulation",
}

export enum ZatcaEnvironmentMode {
    Production = 'ZATCA-Code-Signing',
    Simulation = 'PREZATCA-Code-Signing',
    Sandbox = 'TSTZATCA-Code-Signing'
}

export const ZatcaEnvironmentMap: { [key in ZatcaEnvironmentUrl]: ZatcaEnvironmentMode } = {
    [ZatcaEnvironmentUrl.Production]: ZatcaEnvironmentMode.Production,
    [ZatcaEnvironmentUrl.Simulation]: ZatcaEnvironmentMode.Simulation,
    [ZatcaEnvironmentUrl.Sandbox]: ZatcaEnvironmentMode.Sandbox
};