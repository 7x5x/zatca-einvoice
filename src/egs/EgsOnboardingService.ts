// src/egs/EgsOnboardingService.ts
import { IEgsOnboardingService } from "./IEgsOnboardingService";
import { CSRGenerateOptions, IInvoiceType, ZATCASigningCSR } from "../zatca/signing/generateCSR";
import { ZatcaClient } from "../clients/ZatcaClient";
import { simplifiedInvoices } from "../seed/testSimplified";
import { standardInvoices } from "../seed/testStandard";
import { EGSUnitInfo } from "../types/EGSUnitInfo.interface";
import { logger } from "../utils/logger";

export class EgsOnboardingService implements IEgsOnboardingService {

    private zatcaSigningCSR: ZATCASigningCSR;
    private zatcaClient: ZatcaClient;
    private csrOptions: EGSUnitInfo;

    constructor(csrOptions: CSRGenerateOptions, zatcaClient: ZatcaClient ) {
        this.zatcaSigningCSR = new ZATCASigningCSR(csrOptions);
        this.zatcaClient = zatcaClient;
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

        // Step 1: Generate a private key and CSR.
        logger("Onboarding", "info", "🔵 Step 1: Generating CSR...");
        const { privateKey, csr } = this.zatcaSigningCSR.generate();

        // Step 2: Send the signed CSR along with OTP.
        // The function sendOnboardingRequest handles the API call.
        logger("Onboarding", "info", "🟢 Step 2: Sending onboarding request...");
        const onboardingCSID = await this.zatcaClient.issueCSID(csr, otp);
        this.zatcaClient.setAuth({ username: onboardingCSID.binarySecurityToken, password: onboardingCSID.secret });

        logger("Onboarding", "info","🟡 Step 3: Signing and Sending Test Invoice...");
        this.processInvoices(csr, privateKey);


        // Step 4: Send the onboardingCSID.requestid to get ProductionCSID.
        logger("Onboarding", "info", "🔵 Step 4: Requesting Production CSID...");
        const ProductionCSID = await this.zatcaClient.issueProductionCSID(onboardingCSID.requestid);

        // Return the onboarding CSID
        return ProductionCSID;
    }


    /**
     * Processes test invoices based on invoice type.
     * @param csr - Certificate Signing Request
     * @param privateKey - Generated private key
     */
    private processInvoices(csr: string, privateKey: string) {

        const standard = standardInvoices(this.csrOptions);
        const simplified = simplifiedInvoices(this.csrOptions);

        let invoicesToProcess: any[] = [];

        switch (this.csrOptions.invoiceType) {
            case IInvoiceType.Standerd:
                invoicesToProcess = standard;
                break;
            case IInvoiceType.Simplified:
                invoicesToProcess = simplified;
                break;
            default:
                invoicesToProcess = [...standard, ...simplified];
                break;
        }

        invoicesToProcess.forEach((invoice) => {
            invoice.sign(csr, privateKey).then((result) => {
                console.log(result);//loogger 
                this.zatcaClient.complianceCheck(this.csrOptions.uuid, result.invoice_hash, result.signed_invoice_string);
            });

        });
    }
}
