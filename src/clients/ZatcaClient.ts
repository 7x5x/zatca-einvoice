import axios, { AxiosInstance } from "axios";
import { handleError } from "../utils/handleError";
import { logger } from "../utils/logger";
import { TAuth } from "../types/TAuth";
import { ZatcaEnvironmentUrl } from "../types/EZatcaEnvironment";



export class ZatcaClient {
    private api: AxiosInstance;
    private username: string;
    private password: string;
    private language: "ar" | "en";
    private version: string;
    private environment: ZatcaEnvironmentUrl;

    constructor(
        environment: ZatcaEnvironmentUrl = ZatcaEnvironmentUrl.Production,
        language: "ar" | "en" = "en",
        version: string = "V2",
        username?: string,
        password?: string
    ) {
        this.environment = environment;
        this.username = username;
        this.password = password;
        this.language = language;
        this.version = version;

        this.api = axios.create({
            baseURL: environment,
            auth: { username, password },
            headers: {
                "Accept-Language": language,
                "Content-Type": "application/json",
                "Accept-Version": version,
            },
        });
    }

    setAuth(auth: TAuth) {
        this.username = auth.username;
        this.password = auth.password;
        this.api = axios.create({
            baseURL: this.environment,
            auth: auth,
            headers: {
                "Accept-Language": this.language,
                "Content-Type": "application/json",
                "Accept-Version": this.version,
            },
        });
    }
    getEnvironment() {
        return this.environment;
    }


    async reportInvoice(uuid: string, invoiceHash: string, invoice: any, cleared: boolean = true) {
        return this.request("post", "invoices/reporting/single", {
            uuid,
            invoiceHash,
            invoice,
        }, {
            "Clearance-Status": cleared ? "1" : "0",
        });
    }

    async clearInvoice(uuid: string, invoiceHash: string, invoice: any, cleared: boolean = true) {
        return this.request("post", "invoices/clearance/single", {
            uuid,
            invoiceHash,
            invoice,
        }, {
            "Clearance-Status": cleared ? "1" : "0",
        });
    }

    async issueCSID(csr: string, otp: string) {
        logger(`Onboarding`, "info",
            `Sending CSR and OTP to compliance. CSR Length: ${csr.length}, OTP Length: ${otp.length}`
        );

        return this.request("post", "compliance", { csr }, { OTP: otp }, false);
    }

    async complianceCheck(uuid: string, invoiceHash: string, invoice: any) {
        return this.request("post", "compliance/invoices", {
            uuid,
            invoiceHash,
            invoice,
        });
    }

    async issueProductionCSID(complianceRequestId: string) {
        return this.request("post", "production/csids", { compliance_request_id: complianceRequestId });
    }

    async renewProductionCSID(otp: string, csr: string) {
        return this.request("patch", "production/csids", { csr }, { OTP: otp });
    }

    private async request(method: "get" | "post" | "patch", path: string, data: any = {}, headers: any = {}, auth: boolean = true) {
        try {
            const response = await this.api.request({ method, url: path, data, headers });
            logger("Request to ZATCA API", "info", `Request to ${path} was successful `);
            return response.data;
        } catch (error) {
            handleError(error, "Request to ZATCA API failed");
            throw error;
        }
    }
}
