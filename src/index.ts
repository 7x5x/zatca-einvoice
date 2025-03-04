import { ZatcaClient } from "./clients/ZatcaClient";
import { EgsOnboardingService } from "./egs/EgsOnboardingService";
import { StandardInvoiceSender } from "./invoice/standard/StandardInvoiceSender";
import { productionData, testInvoice } from "./seed/test";
import { ZatcaEnvironmentUrl } from "./types/EZatcaEnvironment";
import { CSRGenerateOptions, IInvoiceType, ZATCASigningCSR } from "./zatca/signing/generateCSR";



const csrOptions: CSRGenerateOptions = {
    commonName: 'John Doe',
    uuid: crypto.randomUUID(),
    organizationIdentifier: '123456789012345',
    organizationName: 'My Organization',
    organizationUnit: 'My Unit',
    country: 'SA',
    invoiceType: IInvoiceType.Standard,
    location: {
        city: "string",
        city_subdivision: "string",
        street: "string",
        plot_identification: 1,
        building: 1,
        postal_zone: 1,
    },
    businessCategory: 'IT',
    egsSolutionName: 'MySolution',
    egsModel: 'Model123',
    egsSerialNumber: 'SN123456'
};

// Instantiate the CSR signing class

const main = async () => {

    const zatcaClient = new ZatcaClient(ZatcaEnvironmentUrl.Simulation, productionData.cirtifacaate, productionData.secret);
    const standardInvoiceSender = new StandardInvoiceSender(productionData.cirtifacaate, productionData.privateKey, zatcaClient);
    const egsOnboardingService = new EgsOnboardingService(csrOptions, zatcaClient);
    try {

        // egsOnboardingService.onboard('123456');
        const a = await standardInvoiceSender.send(testInvoice);
        console.log(a)
    } catch (error) {
        console.log(error);
    }





}





(async () => {
    await main();
})();

