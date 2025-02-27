import { ZatcaClient } from '../clients/ZatcaClient'; // Make sure to update the import path
import { EGSUnitInfo } from '../types/EGSUnitInfo.interface';
import { CSRGenerateOptions, IInvoiceType, ZatcaEnvironmentMode, ZATCASigningCSR } from '../zatca/signing/generateCSR';

class ZatcaEGSService {
    private zatcaClient: ZatcaClient;
    private egsInfo: EGSUnitInfo;
    private csrOptions: CSRGenerateOptions;
    private environmentMode: ZatcaEnvironmentMode;

    constructor(
        zatcaClient: ZatcaClient,
        egsInfo: EGSUnitInfo,
        environmentMode: ZatcaEnvironmentMode = ZatcaEnvironmentMode.production) {

        this.zatcaClient = zatcaClient;
        this.egsInfo = egsInfo;
        this.csrOptions = {
            commonName: this.egsInfo.custom_id,
            organizationIdentifier: this.egsInfo.VAT_number,
            organizationName: this.egsInfo.VAT_name,
            organizationUnit: this.egsInfo.branch_name,
            country: 'SA',
            invoiceType: IInvoiceType.Mixed,
            address: `${this.egsInfo.location.building} ${this.egsInfo.location.street}, ${this.egsInfo.location.city}`,
            businessCategory: this.egsInfo.branch_industry,
            egsSolutionName: this.egsInfo.branch_name,
            egsModel: this.egsInfo.model,
            egsSerialNumber: this.egsInfo.custom_id,
        }
    }

    /**
     * Generates CSR using provided EGS info.
     * @param csrOptions Information required for generating the CSR.
     * @param mode The ZATCA environment mode.
     * @returns string - Generated CSR.
     */
    generateCSR(): string {
        const csr = ZATCASigningCSR.generateCSR(this.csrOptions, this.environmentMode);
        return csr;
    }

    /**
     * Issues a temporary CSID by sending CSR and OTP to ZATCA.
     * @param csr - The CSR generated.
     * @param otp - The OTP required for issuing CSID.
     * @returns Promise<string> - The CSID issued by ZATCA.
     */
    async issueComplianceCSID(csr: string, otp: string): Promise<string> {
        const response = await this.zatcaClient.issueCSID(csr, otp);
        return response.csid; // Assuming response contains CSID
    }

    /**
     * Issues a production CSID by sending the temporary CSID to ZATCA.
     * @param temporaryCSID - The temporary CSID.
     * @returns Promise<string> - The production CSID issued by ZATCA.
     */
    async issueProductionCSID(temporaryCSID: string): Promise<string> {
        const response = await this.zatcaClient.issueProductionCSID(temporaryCSID);
        return response.csid; // Assuming response contains CSID
    }

    /**
     * Sends a temporary invoice to ZATCA for testing purposes.
     * @param uuid - The UUID of the invoice.
     * @param invoiceHash - The hash of the invoice.
     * @param invoice - The invoice details.
     * @returns Promise<boolean> - True if invoice was successfully sent.
     */
    async sendTestInvoice(uuid: string, invoiceHash: string, invoice: any): Promise<boolean> {
        try {
            await this.zatcaClient.complianceCheck(uuid, invoiceHash, invoice);
            return true;
        } catch (error) {
            console.error("Error sending test invoice:", error);
            return false;
        }
    }
}
