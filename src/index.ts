import { ZatcaClient } from "./clients/ZatcaClient";
import { EgsOnboardingService } from "./egs/EgsOnboardingService";
import { SimplifiedInvoiceSender } from "./invoice/simplified/SimplifiedInvoiceSender";
import { StandardInvoiceSender } from "./invoice/standard/StandardInvoiceSender";
import { productionData, testInvoice } from "./seed/test";
import { ZatcaEnvironmentUrl } from "./types/EZatcaEnvironment";
import { saveInvoice } from "./utils/removeChars";
import { CSRGenerateOptions, IInvoiceType } from "./zatca/signing/generateCSR";



const csrOptions: CSRGenerateOptions = {
    organizationName: 'Majd Al Khaleej Trading Est.',
    organizationIdentifier: '300516966900003',
    commonName: 'EGS-Mj-1',
    organizationUnit: 'Head Office',
    country: 'SA',
    invoiceType: IInvoiceType.Standard,
    location: {
        city: "RAS TANNURAH",
        citySubdivision: "Al Fayha Dist",
        street: "AI Madinah Almunawaruh",
        plotIdentification: 2581,
        building: 7174,
        postalZone: 32817,
    },
    businessCategory: 'TRADING',
    egsSolutionName: 'simulation',
    egsModel: 'IOS',
    egsSerialNumber: '3b7f7b8e-5965-4fbf-a6f0-ef9868c9549e'
};


const main = async () => {

    const zatcaClient = new ZatcaClient(ZatcaEnvironmentUrl.Simulation, productionData.cirtifacaate, productionData.secret);
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

