import { ZatcaClient } from "../clients/ZatcaClient";
import { IInvoiceType } from "../zatca/signing/generateCSR";
import { ZatcaInvoiceService } from "./ZatcaInvoiceService";

class InvoiceManager {
    private zatcaInvoiceService: ZatcaInvoiceService;

    constructor(zatcaClient: ZatcaClient) {
        this.zatcaInvoiceService = new ZatcaInvoiceService(zatcaClient);
    }

    async sendInvoice(uuid: string, invoiceHash: string, invoice: any, type: IInvoiceType, cleared: boolean) {
        if (type === IInvoiceType.Simplified) {
            return await this.zatcaInvoiceService.sendSimplifiedInvoice(uuid, invoiceHash, invoice, cleared);
        } else {
            return await this.zatcaInvoiceService.sendStandardInvoice(uuid, invoiceHash, invoice, cleared);
        }
    }
}
