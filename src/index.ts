import { ZatcaClient } from "./clients/ZatcaClient";
import { EgsOnboardingService } from "./egs/EgsOnboardingService";
import { SimplifiedInvoiceSender } from "./invoice/simplified/SimplifiedInvoiceSender";
import { StandardInvoiceSender } from "./invoice/standard/StandardInvoiceSender";
import { productionData, testInvoice } from "./seed/test";
import { ZatcaEnvironmentUrl } from "./types/EZatcaEnvironment";
import { saveInvoice } from "./utils/removeChars";
import { CSRGenerateOptions, IInvoiceType } from "./zatca/signing/generateCSR";



const csrOptions: CSRGenerateOptions = {
    commonName: 'John Doe',
    organizationIdentifier: '123456789012345',
    organizationName: 'My Organization',
    organizationUnit: 'My Unit',
    country: 'SA',
    invoiceType: IInvoiceType.Standard,
    location: {
        city: "string",
        citySubdivision: "string",
        street: "string",
        plotIdentification: 1,
        building: 1,
        postalZone: 1,
    },
    businessCategory: 'IT',
    egsSolutionName: 'MySolution',
    egsModel: 'Model123',
    egsSerialNumber: 'SN123456'
};


const main = async () => {

    const zatcaClient = new ZatcaClient(ZatcaEnvironmentUrl.Sandbox, productionData.cirtifacaate, productionData.secret);
    const standardInvoiceSender = new StandardInvoiceSender(productionData.cirtifacaate, productionData.privateKey, zatcaClient);
    const simplifiedInvoiceSender = new SimplifiedInvoiceSender(productionData.cirtifacaate, productionData.privateKey, zatcaClient);
    const egsOnboardingService = new EgsOnboardingService(csrOptions, zatcaClient);
    try {

        const res = await egsOnboardingService.onboard('123456');
        // const res = await simplifiedInvoiceSender.send(testInvoice);
        // saveInvoice("Invoice.xml", res.clearedInvoice);
        console.log(JSON.stringify(res, null, 2));

    } catch (error) {
        console.log(JSON.stringify(error, null, 2));
    }
}





(async () => {
    await main();
})();

