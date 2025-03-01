import { TempInvoice } from "../test/invoices";
import { ZatcaClient, ZatcaEnvironmentUrl } from "./clients/ZatcaClient";
import { EgsOnboardingService } from "./egs/EgsOnboardingService";
import { throwErrorObject } from "./utils/errorType";
import { activeSessions } from "./utils/logger";
import { CSRGenerateOptions, ZatcaEnvironmentMode, IInvoiceType, ZATCASigningCSR } from "./zatca/signing/generateCSR";
import { ZATCATaxInvoice } from "./zatca/templates/ZATCATaxInvoice";

import { v4 as uuidv4 } from 'uuid';

const csrOptions: CSRGenerateOptions = {
    commonName: 'John Doe',
    uuid: uuidv4(),
    organizationIdentifier: '123456789012345',
    organizationName: 'My Organization',
    organizationUnit: 'My Unit',
    country: 'SA',
    invoiceType: IInvoiceType.Mixed,
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
const csr = 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ0ZUQ0NBYndDQVFBd2RURUxNQWtHQTFVRUJoTUNVMEV4RmpBVUJnTlZCQXNNRFZKcGVXRmthQ0JDY21GdQpZMmd4SmpBa0JnTlZCQW9NSFUxaGVHbHRkVzBnVTNCbFpXUWdWR1ZqYUNCVGRYQndiSGtnVEZSRU1TWXdKQVlEClZRUUREQjFVVTFRdE9EZzJORE14TVRRMUxUTTVPVGs1T1RrNU9Ua3dNREF3TXpCV01CQUdCeXFHU000OUFnRUcKQlN1QkJBQUtBMElBQktGZ2ltdEVtdlJTQkswenI5TGdKQXRWU0NsOFZQWno2Y2RyNVgrTW9USG84dkhOTmx5Vwo1UTZ1N1Q4bmFQSnF0R29UakpqYVBJTUo0dTE3ZFNrL1ZIaWdnZWN3Z2VRR0NTcUdTSWIzRFFFSkRqR0IxakNCCjB6QWhCZ2tyQmdFRUFZSTNGQUlFRkF3U1drRlVRMEV0UTI5a1pTMVRhV2R1YVc1bk1JR3RCZ05WSFJFRWdhVXcKZ2FLa2daOHdnWnd4T3pBNUJnTlZCQVFNTWpFdFZGTlVmREl0VkZOVWZETXRaV1F5TW1ZeFpEZ3RaVFpoTWkweApNVEU0TFRsaU5UZ3RaRGxoT0dZeE1XVTBORFZtTVI4d0hRWUtDWkltaVpQeUxHUUJBUXdQTXprNU9UazVPVGs1Ck9UQXdNREF6TVEwd0N3WURWUVFNREFReE1UQXdNUkV3RHdZRFZRUWFEQWhTVWxKRU1qa3lPVEVhTUJnR0ExVUUKRHd3UlUzVndjR3g1SUdGamRHbDJhWFJwWlhNd0NnWUlLb1pJemowRUF3SURSd0F3UkFJZ1NHVDBxQkJ6TFJHOApJS09melI1L085S0VicHA4bWc3V2VqUlllZkNZN3VRQ0lGWjB0U216MzAybmYvdGo0V2FxbVYwN01qZVVkVnVvClJJckpLYkxtUWZTNwotLS0tLUVORCBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0K';

const main = async () => {
    const signingCSR = ZATCASigningCSR.generateCSR(csrOptions, ZatcaEnvironmentMode.sandbox);

    const zatcaClient = new ZatcaClient(ZatcaEnvironmentUrl.Sandbox, "en", "V2");
    const egsOnboardingService = new EgsOnboardingService(csrOptions, zatcaClient);

    egsOnboardingService.onboard('123456');

    // const CERTIFICATE = await zatcaClient.issueCSID(csr, "123345");

    // //Generate XML Invoice 
    // // const result = signInvoice(
    // //     TempInvoice,
    // //     true
    // // );

    // //befor req production CSID you should Send 6 invoices 'Mix' set the auth 
    // zatcaClient.setAuth({ username: CERTIFICATE.binarySecurityToken, password: CERTIFICATE.secret });
    // zatcaClient.issueProductionCSID('1234567890123');

    // const a = activeSessions.get(uuidv4());
    // console.log(a);

}



function signInvoice(
    invoice: ZATCATaxInvoice,
    production?: boolean
): { signed_invoice_string: string; invoice_hash: string; qr: string } {
    const certificate = production
        ? this.egs_info.production_certificate
        : this.egs_info.compliance_certificate;
    if (!certificate || !this.egs_info.private_key)
        throwErrorObject({
            message:
                "EGS is missing a certificate/private key to sign the invoice.",
        });

    return invoice.sign(certificate, this.egs_info.private_key);
}


(async () => {
    await main();
})();

