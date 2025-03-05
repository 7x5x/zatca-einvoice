import { ZatcaClient } from "./clients/ZatcaClient";
import { EgsOnboardingService } from "./egs/EgsOnboardingService";
import { StandardInvoiceSender } from "./invoice/standard/StandardInvoiceSender";
import { productionData, testInvoice } from "./seed/test";
import { ZatcaEnvironmentUrl } from "./types/EZatcaEnvironment";
import { CSRGenerateOptions, IInvoiceType } from "./zatca/signing/generateCSR";



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


const main = async () => {

    const zatcaClient = new ZatcaClient(ZatcaEnvironmentUrl.Simulation, productionData.cirtifacaate, productionData.secret);
    const standardInvoiceSender = new StandardInvoiceSender(productionData.cirtifacaate, productionData.privateKey, zatcaClient);
    const egsOnboardingService = new EgsOnboardingService(csrOptions, zatcaClient);
    try {

       const res=await egsOnboardingService.onboard('123456');
        // const res = await standardInvoiceSender.send(testInvoice);
        // saveInvoice("Invoice.xml", res.clearedInvoice);
        console.log(res);

    } catch (error) {
        console.log(JSON.stringify(error, null, 2));
    }
}





(async () => {
    await main();
})();

