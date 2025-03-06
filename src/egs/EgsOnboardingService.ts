// src/egs/EgsOnboardingService.ts
import { IEgsOnboardingService } from "./IEgsOnboardingService";
import * as crypto from 'crypto';
import { CSRGenerateOptions, IInvoiceType, ZATCASigningCSR } from "../zatca/signing/generateCSR";
import { ZatcaClient } from "../clients/ZatcaClient";
import { simplifiedInvoices } from "../seed/testSimplified";
import { standardInvoices } from "../seed/testStandard";
import { EGSUnitInfo } from "../types/EGSUnitInfo.interface";
import { logger } from "../utils/logger";
import { ZatcaEnvironmentMap } from "../types/EZatcaEnvironment";
import { ZATCATaxInvoice } from "../zatca/xmlGenerator/ZATCATaxInvoice";
import { ZATCAInvoiceProps } from "../types/invoice.interface";

const csr2 = 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ0ZUQ0NBYndDQVFBd2RURUxNQWtHQTFVRUJoTUNVMEV4RmpBVUJnTlZCQXNNRFZKcGVXRmthQ0JDY21GdQpZMmd4SmpBa0JnTlZCQW9NSFUxaGVHbHRkVzBnVTNCbFpXUWdWR1ZqYUNCVGRYQndiSGtnVEZSRU1TWXdKQVlEClZRUUREQjFVVTFRdE9EZzJORE14TVRRMUxUTTVPVGs1T1RrNU9Ua3dNREF3TXpCV01CQUdCeXFHU000OUFnRUcKQlN1QkJBQUtBMElBQktGZ2ltdEVtdlJTQkswenI5TGdKQXRWU0NsOFZQWno2Y2RyNVgrTW9USG84dkhOTmx5Vwo1UTZ1N1Q4bmFQSnF0R29UakpqYVBJTUo0dTE3ZFNrL1ZIaWdnZWN3Z2VRR0NTcUdTSWIzRFFFSkRqR0IxakNCCjB6QWhCZ2tyQmdFRUFZSTNGQUlFRkF3U1drRlVRMEV0UTI5a1pTMVRhV2R1YVc1bk1JR3RCZ05WSFJFRWdhVXcKZ2FLa2daOHdnWnd4T3pBNUJnTlZCQVFNTWpFdFZGTlVmREl0VkZOVWZETXRaV1F5TW1ZeFpEZ3RaVFpoTWkweApNVEU0TFRsaU5UZ3RaRGxoT0dZeE1XVTBORFZtTVI4d0hRWUtDWkltaVpQeUxHUUJBUXdQTXprNU9UazVPVGs1Ck9UQXdNREF6TVEwd0N3WURWUVFNREFReE1UQXdNUkV3RHdZRFZRUWFEQWhTVWxKRU1qa3lPVEVhTUJnR0ExVUUKRHd3UlUzVndjR3g1SUdGamRHbDJhWFJwWlhNd0NnWUlLb1pJemowRUF3SURSd0F3UkFJZ1NHVDBxQkJ6TFJHOApJS09melI1L085S0VicHA4bWc3V2VqUlllZkNZN3VRQ0lGWjB0U216MzAybmYvdGo0V2FxbVYwN01qZVVkVnVvClJJckpLYkxtUWZTNwotLS0tLUVORCBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0K';

export class EgsOnboardingService implements IEgsOnboardingService {

    private zatcaSigningCSR: ZATCASigningCSR;
    private zatcaClient: ZatcaClient;
    private csrOptions: EGSUnitInfo;

    constructor(csrOptions: CSRGenerateOptions, zatcaClient: ZatcaClient) {
        this.zatcaClient = zatcaClient;
        const mode = ZatcaEnvironmentMap[this.zatcaClient.getEnvironment()];
        this.zatcaSigningCSR = new ZATCASigningCSR(csrOptions, mode);
        this.csrOptions = csrOptions;
    }
    /**
     * Orchestrates the onboarding process:
     * 1. Generates a private key and CSR.
     * 2. Signs the CSR with the private key.
     * 3. Sends the signed CSR with the provided OTP to ZATCA.
     *
     * @param otp - One Time Password for onboarding.
     * @returns A Promise that resolves to the CSID as a string.
     */

    async onboard(otp: string): Promise<string> {
        const startTime = Date.now();
        try {
            // Step 1: Generate a private key and CSR.
            const { privateKey, csr } = this.zatcaSigningCSR.generate();

            // Step 2: Send the signed CSR along with OTP.
            // The function sendOnboardingRequest handles the API call.
            const onboardingCSID = await this.zatcaClient.issueCSID(csr2, otp);
            this.zatcaClient.setAuth({ username: onboardingCSID.binarySecurityToken, password: onboardingCSID.secret });


            // Step 3: Process test invoices.
            await this.processInvoices(onboardingCSID.binarySecurityToken, privateKey);

            // Step 4: Send the onboardingCSID.requestid to get ProductionCSID.
            const ProductionCSID = await this.zatcaClient.issueProductionCSID(onboardingCSID.requestID);

            const endTime = Date.now();
            logger("Onboarding", "info", `Step 3 completed successfully in ${(endTime - startTime) / 1000}s \n \n `);

            // Return the onboarding CSID
            return ProductionCSID;
        } catch (error) {
            logger("Onboarding", "error", `Error during onboarding: ${error.message}`);
            logger("Onboarding", "debug", `Stack Trace: ${error.stack}`);
            throw error
        }

    }


    /**
     * Processes test invoices based on invoice type.
     * @param CSID - onboarding Certificate Signing Request
     * @param privateKey - Generated private key
     */
    private async processInvoices(CSID: string, privateKey: string) {


        const standard: ZATCAInvoiceProps[] = standardInvoices(this.csrOptions);
        const simplified: ZATCAInvoiceProps[] = simplifiedInvoices(this.csrOptions);

        let invoicesToProcess: ZATCAInvoiceProps[] = [];

        switch (this.csrOptions.invoiceType) {
            case IInvoiceType.Standard:
                invoicesToProcess = standard;
                break;
            case IInvoiceType.Simplified:
                invoicesToProcess = simplified;
                break;
            default:
                invoicesToProcess = [...standard, ...simplified];
                break;
        }

        let PIH = "NWZlY2ViNjZmZmM4NmYzOGQ5NTI3ODZjNmQ2OTZjNzljMmRiYzIzOWRkNGU5MWI0NjcyOWQ3M2EyN2ZiNTdlOQ==";

        for (const [i, invoiceData] of invoicesToProcess.entries()) {

            try {
                invoiceData.PIH = PIH;
                const ICV = i + 1;
                invoiceData.invoiceCounter = ICV;

                const invoice = new ZATCATaxInvoice({ props: { ...invoiceData } });
                const { invoiceHash, signedInvoiceString } = invoice.sign(CSID, privateKey);
                const base64Invoice = Buffer.from(signedInvoiceString).toString('base64');

                await this.zatcaClient.complianceCheck(invoiceData.uuid, invoiceHash, base64Invoice);
                logger("Onboarding", "success", `Invoice ${ICV} successfully processed and sent to zatca.`);

                PIH = invoiceHash;


            } catch (error) {
                logger("Onboarding", "error", `Error processing Invoice `);
                throw error;// Rethrow error for handling at a higher level
            }

        }

    }
}
